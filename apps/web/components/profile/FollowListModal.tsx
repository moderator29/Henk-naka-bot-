"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getFollowList, type FollowPerson } from "@/lib/follows/actions";
import { toggleFollow } from "@/lib/engagement/actions";

/**
 * Tappable followers / following list with follow-back. Loads on open and lets
 * the viewer follow/unfollow each person inline.
 */
export function FollowListModal({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}) {
  const { push } = useToast();
  const [people, setPeople] = useState<FollowPerson[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    getFollowList(userId, type).then(setPeople);
  }, [userId, type]);

  async function toggle(p: FollowPerson) {
    const next = !p.followedByMe;
    setPending(p.id);
    setPeople((cur) =>
      cur?.map((x) => (x.id === p.id ? { ...x, followedByMe: next } : x)) ?? null
    );
    const res = await toggleFollow(p.username, next);
    setPending(null);
    if (!res.ok) {
      setPeople((cur) =>
        cur?.map((x) => (x.id === p.id ? { ...x, followedByMe: !next } : x)) ?? null
      );
      if (res.needsAuth) push({ tone: "error", title: "Sign in to follow" });
    }
  }

  const title = type === "followers" ? "Followers" : "Following";

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={title} className="w-[calc(100vw-2rem)] max-w-md">
        <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-1">
          {people === null ? (
            <p className="text-sm text-lilac/50 py-6 text-center">Loading…</p>
          ) : people.length === 0 ? (
            <p className="text-sm text-lilac/50 py-6 text-center">
              {type === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            people.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                <Link
                  href={`/creators/${p.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <span className="h-10 w-10 rounded-full overflow-hidden bg-gradient-primary grid place-items-center text-white font-semibold flex-shrink-0">
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      p.displayName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-white truncate">{p.displayName}</span>
                    <span className="block text-xs text-lilac/50 truncate">@{p.username}</span>
                  </span>
                </Link>
                {!p.isMe && (
                  <Button
                    size="sm"
                    variant={p.followedByMe ? "glass" : "primary"}
                    loading={pending === p.id}
                    onClick={() => toggle(p)}
                  >
                    {p.followedByMe ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
