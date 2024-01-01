import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase/firebase";
import { VscSignOut } from "react-icons/vsc";
import { useContext, useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { UserContext } from "../../context/userContext";
import { storage } from "../../firebase/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import Compressor from "compressorjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Head from "next/head";
import ProgressBar from "../../components/ProgressBar";

interface Memory {
  localImgUrl: string;
  file: File;
  id: string;
  isUploaded: boolean;
  uploadedUrl?: string;
}

const IMAGES_TO_UPLOAD = 25;

const landingPage = () => {
  const router = useRouter();
  const { userUid, username } = useContext(UserContext);

  function logOut() {
    signOut(auth).then(() => {
      router.push("/");
    });
  }
  const [memories, setMemories] = useState<Memory[]>([]);

  // When user selects new images, refresh the memories array
  const onImageChange = (e: any) => {
    e.preventDefault();
    const files = e.target?.files;
    if (!files || !files[0]) return;
    const newMemories: Memory[] = [];

    // Make sure it's IMAGES_TO_UPLOAD images
    if (files.length !== IMAGES_TO_UPLOAD) {
      alert(`Please select ${IMAGES_TO_UPLOAD} images`);
      return;
    }

    // Loop through the files and append new items to the array
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newMemories.push({
        file: file,
        localImgUrl: URL.createObjectURL(file),
        id: file.name,
        isUploaded: false,
      });
    }
    setMemories(newMemories);
  };

  // Drag and drop helper function
  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const reorder = (list: Memory[], startIndex: number, endIndex: number) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
    };

    const items = reorder(
      memories,
      result.source.index,
      result.destination.index
    );

    setMemories(items);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [numUploaded, setNumUploaded] = useState(0);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (memories.length === 0) return;

    setIsUploading(true);
    setNumUploaded(0);

    // Helper function to upload a memory
    const uploadMemory = async (memory: Memory) => {
      return new Promise((resolve, reject) => {
        new Compressor(memory.file, {
          quality: 0.1,
          success: (compressedFile) => {
            const storageRef = ref(storage, `${userUid}/${memory.id}`);
            const uploadTask = uploadBytesResumable(storageRef, compressedFile);

            uploadTask.on(
              "state_changed",
              (snapshot) => {},
              (error) => {
                reject(error);
              },
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  setNumUploaded((numUploaded) => numUploaded + 1);
                  resolve(downloadURL);
                });
              }
            );
          },
          error: (err) => {
            reject(err.message);
          },
        });
      });
    };

    // Upload all memories asynchronously
    const uploadedUrls = await Promise.all(
      memories.map(async (memory) => await uploadMemory(memory))
    );

    // Update memories with uploaded URLs
    setMemories((oldMemories: Memory[]) =>
      oldMemories.map((memory, index) => ({
        ...memory,
        uploadedUrl: uploadedUrls[index] as string | undefined,
        isUploaded: true,
      }))
    );

    // Update database with uploaded URLs
    await setDoc(doc(db, "users", userUid), {
      memories: uploadedUrls,
    });

    setIsUploading(false);

    alert("Upload complete!");
  };

  return (
    <>
      <Head>
        <title>Memory Lane - Upload</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="flex flex-col items-center  min-h-screen h-fit min-w-full pb-32 bg-background">
        <h1 className="text-4xl md:text-6xl text-center font-bold  pt-8 md:pt-12 text-white">
          Memory Lane
        </h1>
        <h2 className="text-2xl md:text-4xl text-center font-bold  pt-4 md:pt-8 text-white">
          Welcome, {username}
        </h2>
        <VscSignOut
          onClick={logOut}
          className="text-red h-8 w-8 md:h-12 md:w-12  md:cursor-pointer md:hover:scale-105 md:transition-transform"
        />
        {isUploading ? (
          <div className="flex flex-col justify-center align-middle mt-6">
            <ProgressBar value={numUploaded} maxValue={memories.length} />
            <p className="text-white text-center">
              {numUploaded} / {memories.length} memories uploaded
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            {memories.length === 0 ? (
              <p className="text-white text-center mt-8">
                Please select {IMAGES_TO_UPLOAD} photos along a path you are
                familiar with (eg: daily commute to school)
              </p>
            ) : (
              <p className="text-white text-center mt-8">
                Drag and drop the photos to the correct order
              </p>
            )}
            <div className="w-full flex flex-col justify-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="w-60 my-4 mx-auto cursor-pointer bg-blue text-white py-2 px-4 rounded inline-block text-center"
              >
                {memories.length !== IMAGES_TO_UPLOAD
                  ? `Select ${IMAGES_TO_UPLOAD} images`
                  : `Reselect ${IMAGES_TO_UPLOAD} images`}
              </label>
              {memories.length === IMAGES_TO_UPLOAD && (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className=""
                      >
                        {memories.map((memory, index) => (
                          <Draggable
                            key={memory.id}
                            draggableId={memory.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex justify-center align-middle mt-2"
                              >
                                <img
                                  key={index}
                                  src={memory.localImgUrl}
                                  alt="memory"
                                  className="object-cover w-64"
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
              {memories.length > 0 && (
                <button
                  type="submit"
                  className="w-60 m-auto mt-4 bg-green hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
                >
                  Confirm
                </button>
              )}
            </div>
          </form>
        )}
      </section>
    </>
  );
};

export default landingPage;
