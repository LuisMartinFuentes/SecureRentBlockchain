import React from "react";

export default function ErrorAlert({ message }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-fadeIn">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
