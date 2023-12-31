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

interface Memory {
  localImgUrl: string;
  file: File;
  id: string;
  isUploaded: boolean;
  uploadedUrl?: string;
}

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (memories.length === 0) return;

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
  };

  return (
    <section className="flex flex-col items-center  min-h-screen h-fit min-w-full pb-32 bg-gray2">
      <h1 className="text-4xl md:text-6xl text-center font-bold text-gray pt-8 md:pt-12">
        Memory Lane
      </h1>
      <h2 className="text-2xl md:text-4xl text-center font-bold text-gray pt-4 md:pt-8">
        Welcome, {username}
      </h2>
      <VscSignOut
        onClick={logOut}
        className="text-gray h-8 w-8 md:h-12 md:w-12  md:cursor-pointer md:hover:scale-105 md:transition-transform"
      />
      <form onSubmit={handleSubmit} className="form">
        <input type="file" multiple accept="image/*" onChange={onImageChange} />
        {memories.length > 0 && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
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

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Confirm
        </button>
      </form>
    </section>
  );
};

export default landingPage;
