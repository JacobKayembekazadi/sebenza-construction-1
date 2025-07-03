"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type WeatherForecastData } from "@/lib/data"
import { Sun, Cloud, Cloudy, CloudRain, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherForecastProps {
  forecasts: WeatherForecastData[]
}

const WeatherIcon = ({ icon }: { icon: WeatherForecastData['icon'] }) => {
    switch(icon) {
        case 'Sun': return <Sun className="h-8 w-8 text-accent" />;
        case 'Cloud': return <Cloud className="h-8 w-8 text-muted-foreground" />;
        case 'Cloudy': return <Cloudy className="h-8 w-8 text-muted-foreground" />;
        case 'CloudRain': return <CloudRain className="h-8 w-8 text-primary" />;
        case 'Wind': return <Wind className="h-8 w-8 text-muted-foreground" />;
    }
}


export function WeatherForecast({ forecasts }: WeatherForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5-Day Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-4">
          {forecasts.map((forecast, index) => (
            <div key={forecast.day} className={cn(
                "flex flex-col items-center gap-2 text-center flex-1 p-2 rounded-md min-w-[60px]",
                index === 0 && "bg-muted"
            )}>
              <p className="font-semibold text-sm">{forecast.day}</p>
              <WeatherIcon icon={forecast.icon} />
              <p className="font-bold text-lg">{forecast.temp}°F</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
