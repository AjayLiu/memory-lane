import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase/firebase";
import { VscSignOut } from "react-icons/vsc";
import { useContext, useEffect, useState } from "react";
import {
  collection,
  collectionGroup,
  DocumentData,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { UserContext } from "../../context/userContext";
import { storage } from "../../firebase/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

const landingPage = () => {
  const router = useRouter();
  const { userUid, username } = useContext(UserContext);

  function logOut() {
    signOut(auth).then(() => {
      router.push("/");
    });
  }
  const [imgUrl, setImgUrl] = useState(null);
  const [progresspercent, setProgresspercent] = useState(0);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const files = e.target[0]?.files;
    if (!files || !files[0]) return;
    console.log(files);
    for (let file of files) {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgresspercent(progress);
        },
        (error) => {
          alert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImgUrl(downloadURL);
          });
        }
      );
    }
  };

  return (
    <section className="flex flex-col items-center bg-split-blue-gray min-h-screen h-fit min-w-full pb-32">
      <VscSignOut
        onClick={logOut}
        className="absolute text-gray h-8 w-8 md:h-12 md:w-12 right-8 top-8 md:cursor-pointer md:hover:scale-105 md:transition-transform"
      />
      <h1 className="text-4xl md:text-6xl text-center font-bold text-gray pt-8 md:pt-12">
        Memory Lane
      </h1>
      <h2 className="text-2xl md:text-4xl text-center font-bold text-gray pt-4 md:pt-8">
        Welcome, {username}
      </h2>
      <form onSubmit={handleSubmit} className="form">
        <input type="file" multiple accept="image/*" />
        <button type="submit">Upload</button>
      </form>
      {!imgUrl && (
        <div className="outerbar">
          <div className="innerbar" style={{ width: `${progresspercent}%` }}>
            {progresspercent}%
          </div>
        </div>
      )}
      {imgUrl && <img src={imgUrl} alt="uploaded file" height={200} />}
    </section>
  );
};

export default landingPage;
