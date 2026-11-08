"use client";

import Link from "next/link";
import { QuietButton } from "@/components/admin/fields";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";

export function AdminVerification() {
  const { restaurants, updateRestaurant } = useArchive();
  const pending = restaurants.filter((restaurant) => !restaurant.verified);
  const verified = restaurants.filter((restaurant) => restaurant.verified);

  return (
    <div className="px-4 py-5">
      <h2 className="font-serif text-3xl">核實</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">蓋印表示地址、時間和招牌已在入藏當日核對過。</p>
      <Section title="待核實" empty="沒有待核實的紀錄。">
        {pending.map((restaurant) => (
          <Row
            key={restaurant.id}
            name={restaurant.name}
            meta={districtName(restaurant.districtId)}
            href={`/admin/restaurants/${restaurant.id}`}
            action="蓋印"
            onAction={() => updateRestaurant(restaurant.id, { verified: true })}
          />
        ))}
      </Section>
      <Section title="已核實" empty="尚未有核實紀錄。">
        {verified.map((restaurant) => (
          <Row
            key={restaurant.id}
            name={restaurant.name}
            meta={districtName(restaurant.districtId)}
            href={`/admin/restaurants/${restaurant.id}`}
            action="撤印"
            onAction={() => updateRestaurant(restaurant.id, { verified: false })}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const filled = items.some(Boolean);
  return (
    <section className="mt-8">
      <h3 className="font-serif text-2xl">{title}</h3>
      {filled ? <ul className="mt-2">{children}</ul> : <p className="mt-3 text-sm text-ink-faint">{empty}</p>}
    </section>
  );
}

function Row({
  name,
  meta,
  href,
  action,
  onAction,
}: {
  name: string;
  meta: string;
  href: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line py-3">
      <Link href={href} className="min-w-0">
        <span className="block truncate font-serif text-lg">{name}</span>
        <span className="block text-[12px] text-ink-soft">{meta}</span>
      </Link>
      <QuietButton className="shrink-0 px-3 py-2" onClick={onAction}>
        {action}
      </QuietButton>
    </li>
  );
}
