import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";

export const useOMIEData = routeLoader$(async () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const strNow = `${y}${m}${d}`;
  const response = await fetch(
    `https://www.omie.es/es/file-download?parents%5B0%5D=marginalpdbc&filename=marginalpdbc_${strNow}.1`
  );
  const csv = await response.text();
  const lines = csv.split("\r\n");
  const series = lines
    .slice(1, 25)
    .map((line) => Number(line.split(";").at(4)));
  const max = series.reduce((a, b) => Math.max(a, b));
  const min = series.reduce((a, b) => Math.min(a, b));
  return { date: `${d}/${m}/${y}`, series, max, min };
});

export default component$(() => {
  const omie = useOMIEData();
  const range = omie.value.max - omie.value.min;
  const scaled = omie.value.series.map(
    (x) => ((x - omie.value.min) / range) * 100
  );
  return (
    <div class="p-4">
      <h1 class="font-bold text-2xl pb-3">{omie.value.date}</h1>
      <div class="flex flex-row gap-[2px] border mt-6">
        {scaled.map((value, i) => (
          <div class="flex-1 flex flex-col items-stretch">
            <div class="flex-1" />
            <div class="h-[400px] flex flex-col justify-end items-stretch">
              <div
                class="flex flex-col items-center bg-red-500 relative"
                style={{ height: `${Math.floor(value * 4)}px` }}
              >
                <div class="absolute top-[-1.5em] left-0 right-0 text-center text-stone-500">
                  {Math.floor(omie.value.series[i])}
                </div>
                <div class="pb-1 text-center text-sm absolute bottom-[-2em]">
                  {i}h
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "OMIE Spot Hoy",
  meta: [
    {
      name: "Curva horaria hoy",
    },
  ],
};
