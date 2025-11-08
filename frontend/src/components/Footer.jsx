export default function Footer() {
  return (
    <footer className="cursor-default select-none text-black text-center py-3 mt-8">
      <p className="cursor-default text-sm select-none">
        © {new Date().getFullYear()} By <span className="font-semibold">Luis M. Fuentes</span>
      </p>
    </footer>
  );
}
