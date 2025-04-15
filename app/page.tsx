/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect } from "react";
import { Meal } from "../models/Meal";
import toast from "react-hot-toast";
import { Edit3, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation'

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [totalCaloriesToday, setTotalCaloriesToday] = useState(0);
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    calories: "",
    datetime: "",
    type: "",
    image: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter()


  useEffect(() => {
    fetchMeals();
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await fetch("/api/meals");
      const data = await response.json();
      if (response.ok) {
        setMeals(data);
        const today = new Date();
        const todayMeals = data.filter((meal: Meal) => {
        const mealDate = new Date(meal.datetime);
        return (
          mealDate.getDate() === today.getDate() &&
          mealDate.getMonth() === today.getMonth() &&
          mealDate.getFullYear() === today.getFullYear()
        );
      });
      const total = todayMeals.reduce(
        (sum: number, meal: Meal) => sum + Number(meal.calories),
        0
      );
      setTotalCaloriesToday(total);
      } else {
        toast.error("Erro ao carregar as refeições");
      }
    } catch (error) {
      toast.error(`Erro ao buscar refeições: ${error}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    let imageUrl = '';
  
    const fileInput = document.querySelector('input[name="image"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
  
    if (file) {
      const imageForm = new FormData();
      imageForm.append('image', file);
  
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageForm,
        });
  
        const uploaded = await uploadRes.json();
        console.log(uploaded)
        imageUrl = uploaded.url;
      } catch (uploadErr) {
        toast.error(`Erro ao fazer upload da imagem: {}${uploadErr}`);
        return;
      }
    }
  
    const formDataToSubmit = {
      name: formData.name,
      description: formData.description,
      calories: formData.calories,
      datetime: formData.datetime,
      type: formData.type,
      image: imageUrl, // incluímos a URL da imagem aqui
    };
  
    try {
      const response = await fetch(
        editingId ? `/api/meals/${editingId}` : "/api/meals",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataToSubmit),
        }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        toast.success(editingId ? "Refeição atualizada!" : "Refeição registrada com sucesso!");
        setFormData({
          name: "",
          description: "",
          calories: "",
          datetime: "",
          type: "",
          image: "",
        });
        setEditingId(null);
        setShowModal(false);
        fetchMeals();
      } else {
        toast.error(`Erro: ${result.error || "Erro desconhecido"}`);
      }
    } catch (error) {
      toast.error(`Erro ao enviar a refeição: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Tem certeza que deseja excluir esta refeição?");
    if (!confirm) return;
  
    try {
      const response = await fetch(`/api/meals/${id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        toast.success("Refeição excluída com sucesso!");
        fetchMeals(); // Recarrega a lista
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.message || "Erro ao excluir"}`);
      }
    } catch (error) {
      toast.error(`Erro ao excluir refeição:", ${error}`);
    }
  };

  const filteredMeals = filterType
  ? meals.filter((meal) => meal.type === filterType)
  : meals;

  console.log(filteredMeals);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white z-50 relative">
        <h1 className="text-3xl font-bold text-red-600 mb-4">MealTracker</h1>
        <div className="w-64 h-1 bg-amber-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-75"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  }
  return (
    
    <main className="bg-[#eff1f3]">
      <nav className="flex items-center justify-around bg-red-600">
        <div className="flex p-5 max-w-5xl items-center justify-between w-full">
          <h1 className="text-3xl font-bold text-yellow-300 cursor-pointer" 
            onClick={() => router.push('/')}>
            Meal<strong className="text-white">Tracker</strong>
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-yellow-300 text-white px-4 py-2 rounded-xl hover:bg-white hover:text-red-600 cursor-pointer transition-colors duration-300 font-extrabold text-shadow-xs"
          >
            Adicionar Refeição
          </button>
        </div>
      </nav>
      <div className="p-8 max-w-5xl mx-auto">
        {showModal && (
          <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Cadastrar Refeição</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Nome da refeição"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="Descrição"
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={handleChange}
              />
              <input
                type="number"
                name="calories"
                placeholder="Calorias"
                className="w-full p-2 border rounded"
                value={formData.calories}
                onChange={handleChange}
              />
              <input
                type="datetime-local"
                name="datetime"
                className="w-full p-2 border rounded"
                value={formData.datetime}
                onChange={handleChange}
              />
              <select
                name="type"
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Selecione o tipo</option>
                <option value="Café da manhã">Café da manhã</option>
                <option value="Almoço">Almoço</option>
                <option value="Lanche da tarde">Lanche da tarde</option>
                <option value="Janta">Janta</option>
              </select>
              <input
                type="file"
                accept="image/*"
                name="image"
                className="w-full p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-400 cursor-pointer transition-colors duration-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer transition-colors duration-300"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        
        
        <div className="mt-6">
          <div className="flex justify-between items-center ">
            <h2 className="text-xl font-bold mb-4">Refeições</h2>
            <div className="mb-4 text-base font-semibold">
                Total de calorias hoje: <span className="text-red-600">{totalCaloriesToday}</span>
            </div>
          </div>
            <div className="flex gap-2 mb-4">
              {["Café da manhã", "Almoço", "Lanche da tarde", "Janta"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded shadow-md cursor-pointer  ${
                    filterType === type ? "bg-yellow-500 text-white" : "bg-white text-black hover:bg-gray-200 transition duration-300"
                  }`}
                >
                  {type}
                </button>
              ))}
              <button
                onClick={() => setFilterType("")}
                className="px-3 py-1 rounded shadow-md bg-white text-black cursor-pointer hover:bg-gray-200 transition-colors duration-300"
              >
                Mostrar todos
              </button>
            </div>
            {meals.length === 0 ? (
              <p className="text-gray-500">Nenhuma refeição cadastrada ainda.</p>
            ) : (
              <ul className="flex flex-wrap gap-4 mt-6">
                {filteredMeals.map((meal) => (
                  <li
                    key={meal._id}
                    className="w-full sm:w-[48%] lg:w-[30%] bg-white p-6 rounded-xl shadow-md flex flex-col justify-between hover:-translate-y-1 transition duration-300"
                  >
                    <div>
                      <img
                          src={ meal.image || "/default-image.jpg"}
                          alt={meal.name}
                          className="w-full h-40 object-cover rounded mb-2"
                      />
                      <h3 className="text-xl font-bold text-red-600">{meal.name}</h3>
                      <p className="text-gray-700">{meal.description}</p>

                      <div className="mt-4 text-sm text-gray-600 space-y-1">
                        <p><strong>Calorias:</strong> {meal.calories}</p>
                        <p><strong>Data:</strong> {new Date(meal.datetime).toLocaleString("pt-BR")}</p>
                        <p>
                          <strong>Tipo:</strong>{" "}
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
                            {meal.type}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button className="bg-gray-100 p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors duration-300" onClick={() => {
                      setFormData({
                        name: meal.name,
                        description: meal.description,
                        calories: String(meal.calories),
                        datetime: new Date(meal.datetime).toISOString().slice(0, 16),
                        type: meal.type,
                        image: meal.image,
                      });
                      setEditingId(meal._id);
                      setShowModal(true);
                      }}>
                        <Edit3 className="text-blue-600 w-4 h-4" />
                      </button>
                      <button className="bg-gray-100 p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors duration-300"
                      onClick={() => handleDelete(meal._id)}
                      >
                        <Trash2 className="text-red-600 w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
      <div className=" flex justify-center items-center gap-4 fixed bottom-4 right-4 bg-red-600 shadow-lg rounded-xl p-3 z-50">
        <p className="text-sm text-white">Calorias:</p>
        <p className="text-sm font-bold text-white">{totalCaloriesToday}</p>
      </div>
    </main> 
  );
}
