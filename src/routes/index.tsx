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
  return { date: `${d}/${m}/${y}`, series, max };
});

export default component$(() => {
  const omie = useOMIEData();
  const scaled = omie.value.series.map((x) => x / omie.value.max);
  return (
    <div class="p-4">
      <h1 class="font-bold text-4xl pb-5">{omie.value.date}</h1>
      <div class="flex flex-col gap-[2px] border ml-10 mb-6 mr-8">
        {scaled.map((value, i) => (
          <div class="flex-1 flex flex-col items-stretch">
            <div class="flex-1" />
            <div class="flex flex-row justify-start items-stretch">
              <div
                class="h-8 flex flex-row items-center bg-sky-700 relative"
                style={{ width: `${Math.floor(value * 100)}%` }}
              >
                <div class="absolute right-[-1.5em] top-0 bottom-0 flex flex-col justify-center text-center text-stone-500">
                  {Math.floor(omie.value.series[i])}
                </div>
                <div class="flex flex-col justify-center text-right absolute left-[-2.8em] w-[2.2em]">
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
