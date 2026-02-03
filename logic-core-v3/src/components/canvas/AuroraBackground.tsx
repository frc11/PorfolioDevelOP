'use client';

export const AuroraBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-zinc-50">
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
            <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-20%] left-[20%] w-[40vw] h-[40vw] bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000" />

            <style jsx>{`
         @keyframes blob {
           0% { transform: translate(0px, 0px) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0px, 0px) scale(1); }
         }
         .animate-blob {
           animation: blob 7s infinite;
         }
         .animation-delay-2000 {
           animation-delay: 2s;
         }
         .animation-delay-4000 {
           animation-delay: 4s;
         }
       `}</style>
        </div>
    );
};
