export const LoginWithGoogle = () => {
  const loginWithGoogle = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/google/url");
      window.location.href = res.data.url;
    } catch (err) {
      console.error("שגיאה בחיבור לגוגל")
    }
  }
  return (
    <div className="mt-4">
      <button
        onClick={loginWithGoogle}
        className="
          w-full
          flex items-center justify-center gap-3
          bg-white border border-gray-300
          text-gray-700 font-semibold
          py-3 rounded-lg shadow-sm
          hover:shadow-md hover:scale-105
          transition-all duration-300
        "
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        התחברי עם Google
      </button>
    </div>
  );
}