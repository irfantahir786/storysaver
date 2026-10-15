
export function Header() {
  return (
    <header className="py-6 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-4">
            <div className="bg-white text-primary rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl">
                SS
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
            Story Saver
            </h1>
        </div>
        <p className="text-lg text-primary-foreground/90">Download Instagram Stories, Reels, Videos, Photos and DP</p>
      </div>
    </header>
  );
}
