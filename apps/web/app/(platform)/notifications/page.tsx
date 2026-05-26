import {
  Heart,
  UserPlus,
  Coins,
  MessageCircle,
  FileText,
  Megaphone,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn, relativeTime } from "@/lib/utils";
import {
  getNotifications,
  describeNotification,
  type NotificationType,
} from "@/lib/notifications/queries";

export const metadata = { title: "Notifications" };

const ICONS: Record<NotificationType, LucideIcon> = {
  follow: UserPlus,
  subscribe: Heart,
  tip: Coins,
  like: Heart,
  comment: MessageCircle,
  message: MessageCircle,
  post: FileText,
  broadcast: Megaphone,
  system: Info,
};

export default async function NotificationsPage() {
  const items = await getNotifications(50);

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          <span className="text-gradient">Notifications</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Follows, subscriptions, tips, and messages, all in one place.
        </p>
      </header>

      {items.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
          <p className="text-sm text-lilac/50">
            You&apos;re all caught up. New activity shows up here.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Info;
            return (
              <li key={n.id}>
                <Card
                  className={cn(
                    "flex items-center gap-4 py-4",
                    !n.readAt && "border-magenta/30"
                  )}
                >
                  <span className="h-10 w-10 rounded-xl glass flex items-center justify-center text-magenta flex-shrink-0">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-lilac/90">
                      {describeNotification(n)}
                    </p>
                    <time className="text-xs text-lilac/40">
                      {relativeTime(n.createdAt)}
                    </time>
                  </div>
                  {!n.readAt && (
                    <span className="h-2 w-2 rounded-full bg-magenta flex-shrink-0" />
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
