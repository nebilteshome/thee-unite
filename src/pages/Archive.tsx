import { Hash } from 'lucide-react';

export default function Archive() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto min-h-[50vh] flex flex-col items-center justify-center text-center">
      <Hash className="text-accent mb-8" size={64} />
      <h2 className="text-7xl font-black font-display uppercase tracking-tighter mb-8">THE <span className="text-outline">ARCHIVE</span></h2>
      <p className="text-white/40 max-w-lg italic text-lg leading-relaxed">
        Past manifestations preserved in frequency. SERIES_00 is currently locking down. Access denied to historical threads.
      </p>
      <div className="mt-12 h-[1px] w-48 bg-accent/20" />
    </section>
  );
}
