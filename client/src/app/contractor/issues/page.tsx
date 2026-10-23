import { Suspense } from "react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { ContractorIssuesClient } from "@/components/contractor/ContractorIssuesClient";

export default function ContractorIssuesPage() {
  return (
    <>
      <Header />
      <main className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-x-0 top-0 -z-10 h-96" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-10">
          <Suspense
            fallback={
              <div className="space-y-3" aria-busy="true">
                <div className="card h-24 animate-pulse" />
                <div className="card h-24 animate-pulse opacity-80" />
                <div className="card h-24 animate-pulse opacity-60" />
              </div>
            }
          >
            <ContractorIssuesClient />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}