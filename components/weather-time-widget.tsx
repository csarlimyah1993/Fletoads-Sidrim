"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Clock, Calendar } from "lucide-react"

export function WeatherTimeWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weatherIndex, setWeatherIndex] = useState(0)

  // Atualiza o tempo a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Alterna entre diferentes condições climáticas a cada 10 segundos
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      setWeatherIndex((prev) => (prev + 1) % weatherConditions.length)
    }, 10000)

    return () => clearInterval(weatherTimer)
  }, [])

  // Formata a hora atual
  const formattedTime = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Obtém o dia da semana
  const weekday = currentTime.toLocaleDateString("pt-BR", { weekday: "long" })
  const formattedDate = currentTime.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Condições climáticas simuladas para Manaus
  const weatherConditions = [
    { icon: <Sun className="h-8 w-8 text-yellow-500" />, condition: "Ensolarado", temp: "33°C" },
    { icon: <CloudRain className="h-8 w-8 text-blue-400" />, condition: "Chuva Tropical", temp: "29°C" },
    { icon: <Cloud className="h-8 w-8 text-gray-400" />, condition: "Parcialmente Nublado", temp: "31°C" },
    { icon: <CloudLightning className="h-8 w-8 text-purple-500" />, condition: "Tempestade", temp: "28°C" },
    { icon: <Wind className="h-8 w-8 text-blue-300" />, condition: "Úmido", temp: "30°C" },
  ]

  const currentWeather = weatherConditions[weatherIndex]

  // Capitaliza a primeira letra do dia da semana
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <Card className="overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border-none shadow-md w-full">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Seção de data e hora */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-emerald-100">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                <h3 className="font-medium text-emerald-800">Hora Atual</h3>
              </div>
              <motion.div
                key={formattedTime}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold text-emerald-700 mb-2 tracking-wide"
              >
                {formattedTime}
              </motion.div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
                <div className="w-full">
                  <div className="font-medium text-emerald-800 text-sm sm:text-base">{capitalizedWeekday}</div>
                  <div className="text-xs sm:text-sm text-emerald-600">{formattedDate}</div>
                </div>
              </div>
            </div>

            {/* Seção de clima */}
            <div className="flex-1 p-4">
              <div className="flex items-center mb-2">
                <h3 className="font-medium text-emerald-800">Previsão do Tempo</h3>
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Manaus</span>
              </div>
              <div className="flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={weatherIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="mr-4"
                  >
                    {currentWeather.icon}
                  </motion.div>
                </AnimatePresence>
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${weatherIndex}-condition`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="font-medium"
                    >
                      {currentWeather.condition}
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${weatherIndex}-temp`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-2xl font-bold"
                    >
                      {currentWeather.temp}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <motion.div
                className="mt-2"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

