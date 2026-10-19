import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { IssueForm } from "@/components/issues/IssueForm";

export default function NewIssuePage() {
  return (
    <>
      <Header />
      <main className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-x-0 top-0 -z-10 h-96" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-10">
          <IssueForm />
        </div>
      </main>
      <Footer />
    </>
  );
}