import { Hero } from "../sections/Hero";

export default function HomeView() {
  return (
    <div className="flex flex-col flex-1 items-center bg-pink-300 font-sans pt-14">
      <main className="flex flex-col mx-10 my-7 items-center gap-5">
        <Hero image="/heroTest.png"/>
      </main>
    </div>
  );
}