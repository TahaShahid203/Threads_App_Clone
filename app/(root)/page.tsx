import Thread from "@/lib/models/thread.model";
import { fetchThreads } from "../../lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import ThreadCard from "@/components/cards/ThreadCard";
import { redirect } from "next/navigation";

export default async function Home() {
  const results = await fetchThreads(1,30);
  const user = await currentUser();
  if(!user){
    redirect("/sign-in");
  }
  console.log(results);
  return (
    <div>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {results?.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ): (
          <>
            {results?.posts.map((thread) => (
              <ThreadCard
               key={thread._id}
               id={thread._id}
               currentUserId = {user?.id || ""}
               parentId={thread.parentId}
               content={thread.text}
               author={thread.author}
               community={thread.community}
               createdAt={thread.createdAt}
               comments={thread.children}
                />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
