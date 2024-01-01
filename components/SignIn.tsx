import { signInWithPopup } from "firebase/auth";
import Image from "next/image";
import React from "react";
import { FaBrain } from "react-icons/fa";
import { auth, googleProvider } from "../firebase/firebase";

const SignIn = () => {
  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  return (
    <section className="flex flex-col items-center min-h-screen w-full bg-background">
      <div className="flex flex-col items-center justify-center opacity-90 bg-dark m-auto min-h-[70vh] min-w-[70%]">
        <FaBrain className="h-32 w-32 text-orange1 mb-10 mt-[-5rem] text-pink" />
        <h1 className="text-4xl font-bold text-gray2 mb-10 text-white">
          Welcome to Memory Lane
        </h1>
        <button
          onClick={signInWithGoogle}
          className="relative p-0.5 inline-flex items-center justify-center font-bold overflow-hidden group rounded-md"
        >
          <span className="flex gap-2 relative px-12 py-3 transition-all ease-out bg-white rounded-md group-hover:bg-opacity-90 duration-400">
            <Image
              src={"/google.png"}
              className="w-6 h-6 text-white"
              width={100}
              height={100}
              alt="SignInWithGoogle"
            />
            <span className="relative">Sign In</span>
          </span>
        </button>
      </div>
    </section>
  );
};

export default SignIn;
