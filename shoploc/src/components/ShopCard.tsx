import { MapPin, Store } from "lucide-react";
import type { Shop } from "@/types/shop";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Card className="h-full justify-between transition-all hover:shadow-md">
      <div className="flex flex-col">
        <div className="relative h-48 w-full bg-muted flex items-center justify-center overflow-hidden">
          {shop.url ? (
            <img
              src={shop.url}
              alt={shop.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Store className="size-10 opacity-50" />
              <span className="text-xs font-medium">Pas d&apos;image</span>
            </div>
          )}
          {shop.id && (
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 bg-background/80 backdrop-blur-xs font-mono"
            >
              #{shop.id}
            </Badge>
          )}
        </div>

        <CardHeader className="pt-4">
          <CardTitle className="truncate text-lg" title={shop.name}>
            {shop.name}
          </CardTitle>
          <CardDescription className="flex items-start gap-1.5 pt-1">
            <MapPin className="size-4 shrink-0 text-red-500 mt-0.5" />
            <span className="line-clamp-2">{shop.address}</span>
          </CardDescription>
        </CardHeader>
      </div>

      <CardFooter className="justify-between pt-2 pb-4 mt-auto">
        <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">
          Partenaire
        </Badge>
        {shop.id && (
          <a
            href={`/shops/${shop.id}`}
            className={buttonVariants({ size: "sm" })}
          >
            Voir détails
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
