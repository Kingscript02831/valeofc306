
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, ChevronLeft, ChevronRight, X, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

interface EventCardProps {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  image?: string;
  images?: string[];
  location?: string;
  createdAt?: string;
}

const EventCard = ({
  title,
  description,
  eventDate,
  eventTime,
  image,
  images = [],
  location,
  createdAt,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const [config, setConfig] = useState<SiteConfig | null>(null);
  
  const date = new Date(eventDate);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;
  
  const allImages = image ? [image, ...images] : images;
  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_configuration")
        .select("*")
        .single();
      
      if (data) {
        setConfig(data);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      const now = new Date();
      const difference = eventDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const toggleImageFullscreen = () => {
    setIsImageFullscreen(!isImageFullscreen);
  };

  if (!config) return null;

  return (
    <>
      <Card className="overflow-hidden transition-transform hover:scale-[1.02] max-w-sm mx-auto">
        {allImages.length > 0 && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - Imagem ${currentImageIndex + 1}`}
              className="h-full w-full object-cover cursor-pointer"
              onClick={toggleImageFullscreen}
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="mb-2 text-xl font-bold">{title}</h3>
          
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{eventTime}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Contador regressivo mais compacto */}
          <div className="mb-3">
            {countdown.isExpired ? (
              <div className="text-red-500 text-sm font-medium">Evento já aconteceu</div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" style={{ color: config.primary_color }} />
                  <span className="text-xs font-medium" style={{ color: config.primary_color }}>
                    Tempo até o evento:
                  </span>
                </div>
                <div className="flex gap-1 justify-start">
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-white px-2 py-1 rounded-md font-bold text-sm min-w-[2.5rem]"
                      style={{ backgroundColor: config.primary_color }}
                    >
                      {countdown.days}
                    </div>
                    <span className="text-[10px] mt-0.5 text-gray-600">Dias</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-white px-2 py-1 rounded-md font-bold text-sm min-w-[2.5rem]"
                      style={{ backgroundColor: config.primary_color }}
                    >
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] mt-0.5 text-gray-600">Horas</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-white px-2 py-1 rounded-md font-bold text-sm min-w-[2.5rem]"
                      style={{ backgroundColor: config.primary_color }}
                    >
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] mt-0.5 text-gray-600">Min</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-white px-2 py-1 rounded-md font-bold text-sm min-w-[2.5rem]"
                      style={{ backgroundColor: config.primary_color }}
                    >
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] mt-0.5 text-gray-600">Seg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {formattedCreatedAt && (
            <div className="mb-2 text-xs text-gray-500">
              Publicado em {formattedCreatedAt}
            </div>
          )}
          
          <div className={cn("prose prose-sm max-w-none text-sm", !isExpanded && "line-clamp-3")}>
            {description.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index} className="mb-2">{paragraph}</p> : null
            ))}
          </div>

          <Button
            variant="ghost"
            className="mt-2 w-full flex items-center justify-center gap-1 text-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ color: config.primary_color }}
          >
            {isExpanded ? (
              <>
                Ver menos
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Ver mais
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Modal de imagem em tela cheia */}
      {isImageFullscreen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - Imagem ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-black/50"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-black/50"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-black/50"
              onClick={toggleImageFullscreen}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;

