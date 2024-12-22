import Searchbar from "../../components/Searchbar";

const Home = ({ user }) => {
  return (
    <>
      <main>
        <section className="bg-white py-20 px-6 text-center">
          <div className="max-w-screen-lg mx-auto">
            <h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 leading-tight mb-6 p-6 rounded-3xl bg-indigo-100 shadow-lg">
              Find Top Institutes & Professors
            </h1>
            <Searchbar user={user} />
          </div>
        </section>

        <section className="py-16 bg-indigo-100">
          <div className="max-w-screen-lg mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
              <div className="flex flex-col justify-center items-center p-6 bg-indigo-600 rounded-lg shadow-lg transition-all duration-300">
                <img
                  src="/public/education.png"
                  alt="Education"
                  className="w-full h-auto object-contain"
                />
                <p className="mt-6 text-sm text-center text-white">
                  Find the best educational institutions around the world.
                </p>
              </div>

              <div className="flex flex-col justify-center items-center p-6 bg-indigo-600 rounded-lg shadow-lg transition-all duration-300">
                <img
                  src="/public/security.png"
                  alt="Security"
                  className="w-full h-auto object-contain"
                />
                <p className="mt-6 text-sm text-center text-white">
                  Explore secure and reliable academic options.
                </p>
              </div>

              <div className="flex flex-col justify-center items-center p-6 bg-indigo-600 rounded-lg shadow-lg transition-all duration-300">
                <img
                  src="/public/rating.png"
                  alt="Rating"
                  className="w-full h-auto object-contain"
                />
                <p className="mt-6 text-sm text-center text-white">
                  Rate your professors and share experiences with others.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
