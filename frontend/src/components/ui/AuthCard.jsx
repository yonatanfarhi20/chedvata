export default function AuthCard({ children }) {
  return (
    <div className="flex min-h-full flex-1 justify-center overflow-y-auto bg-background md:items-center md:p-6">
      <section className="flex w-full flex-col bg-card px-6 py-8 md:max-w-md md:rounded-2xl md:px-8 md:shadow-xl">
        {children}
      </section>
    </div>
  );
}
