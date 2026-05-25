"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { toggleFollow } from "@/lib/engagement/actions";
import { getFollowers, getFollowing, type FollowUser } from "@/lib/follows/actions";

/** A list of followers or following with a working follow-back control. */
export function FollowListModal({
  userId,
  mode,
  onClose,
}: {
  userId: string;
  mode: "followers" | "following";
  onClose: () => void;
}) {
  const { push } = useToast();
  const [users, setUsers] = useState<FollowUser[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = mode === "followers" ? getFollowers : getFollowing;
    void load(userId).then((u) => {
      if (alive) setUsers(u);
    });
    return () => {
      alive = false;
    };
  }, [userId, mode]);

  async function follow(u: FollowUser) {
    setBusy(u.id);
    const next = !u.isFollowing;
    setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, isFollowing: next } : x)) ?? null);
    const res = await toggleFollow(u.username, next);
    setBusy(null);
    if (res.needsAuth || !res.ok) {
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, isFollowing: !next } : x)) ?? null);
      if (res.needsAuth) push({ tone: "info", title: "Sign in to follow" });
    }
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={mode === "followers" ? "Followers" : "Following"} className="w-[calc(100vw-2rem)] max-w-md">
        <div className="max-h-[60vh] overflow-y-auto">
          {users === null ? (
            <p className="text-sm text-lilac/50 py-4">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-lilac/50 py-4">
              {mode === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            <ul className="flex flex-col">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-1 py-2.5">
                  <Link href={`/creators/${u.username}`} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="h-10 w-10 rounded-full overflow-hidden bg-imperial grid place-items-center text-sm font-display text-white shrink-0">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- avatar from storage
                        <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        u.displayName.slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 text-sm font-medium text-white">
                        {u.displayName}
                        {u.verified && <BadgeCheck size={13} className="text-cyan" />}
                      </span>
                      <span className="block text-xs text-lilac/55 truncate">@{u.username}</span>
                    </span>
                  </Link>
                  {!u.isSelf && (
                    <Button
                      variant={u.isFollowing ? "glass" : "secondary"}
                      size="sm"
                      loading={busy === u.id}
                      onClick={() => follow(u)}
                    >
                      {u.isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
