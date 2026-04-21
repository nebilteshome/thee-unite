import { Instagram, ChevronRight } from 'lucide-react';

export default function Foundry() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-accent text-black p-12 md:p-24 relative overflow-hidden">
        <div className="relative z-10 max-w-xl text-left">
          <h2 className="text-7xl md:text-9xl font-black font-display uppercase leading-[0.8] tracking-tighter mb-12">THE<br/>FOUNDRY</h2>
          <div className="space-y-8">
            <div className="flex items-center gap-6 group border-b border-black/10 pb-4">
              <span className="text-2xl font-black uppercase italic">@excellardaniel</span>
              <ChevronRight className="ml-auto" />
            </div>
            <div className="flex items-center gap-6 group border-b border-black/10 pb-4">
              <span className="text-2xl font-black uppercase italic">@mukulembeze_h</span>
              <ChevronRight className="ml-auto" />
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <div className="bg-black p-12 text-white border border-white/10 shadow-2xl">
            <Instagram className="text-accent mb-6" size={48} />
            <p className="font-black italic text-3xl mb-8 uppercase leading-none">JOIN THE<br/>FREQUENCY</p>
            <a href="https://instagram.com/thee_unite" target="_blank" rel="noreferrer" className="bg-accent text-black px-8 py-3 font-black uppercase text-xs inline-block">FOLLOW</a>
          </div>
        </div>
      </div>
    </section>
  );
}
