// "use client";

// import { useEffect, useState } from "react";
// import RichTextEditor from "@/components/ui/rich-text-editor";
// import toast from "react-hot-toast";
// import SortableItem from "./sortableItem";
// import FAQEditModal from "./FAQEditModal";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";

// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { appToast } from "@/utils/appToast";

// type FAQ = {
//   id: string;
//   question: string;
//   answer: string;
// };

// export default function FAQForm() {
//   const [faqs, setFaqs] = useState<FAQ[]>([]);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loadingFAG, setLoadingFAG] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loadingEdit, setLoadingEdit] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [category, setCategory] = useState("General");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editQuestion, setEditQuestion] = useState("");
//   const [editAnswer, setEditAnswer] = useState("");
//   const [openId, setOpenId] = useState<string | null>(null);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editId, setEditId] = useState<string | null>(null);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         delay: 150, // hold for 150ms before drag
//         tolerance: 5,
//       },
//     }),
//   );
//   useEffect(() => {
//     const fetchFaqs = async () => {
//       setLoadingFAG(true);

//       const res = await fetch("/api/admin/faqs");
//       const data = await res.json();

//       setFaqs(data);
//       setLoadingFAG(false);
//     };

//     fetchFaqs();
//   }, []);

//   const openEditModal = (faq: any) => {
//     setEditId(faq.id);
//     setEditQuestion(faq.question);
//     setEditAnswer(faq.answer);
//     setIsEditOpen(true);
//   };

//   // add
//   const addFAQ = async () => {
//     if (!question || !answer) return;

//     try {
//       setLoading(true);
//       const res = await fetch("/api/admin/faqs", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ question, answer, category }),
//       });

//       const newFaq = await res.json();

//       setFaqs((prev) => [newFaq, ...prev]);
//       setQuestion("");
//       setAnswer("");
//       appToast.success("Success", "FAQ added ✅");
//     } catch (err) {
//       appToast.error("Failed", "Failed to add FAQ ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveEdit = async () => {
//     if (!editId) return;

//     setLoadingEdit(true);

//     try {
//       await fetch(`/api/admin/faqs/${editId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           question: editQuestion,
//           answer: editAnswer,
//           category,
//         }),
//       });

//       setFaqs((prev) =>
//         prev.map((f) =>
//           f.id === editId
//             ? { ...f, question: editQuestion, answer: editAnswer }
//             : f,
//         ),
//       );

//       setIsEditOpen(false);
//       setEditId(null);
//     } finally {
//       setLoadingEdit(false);
//     }
//   };

//   // delete
//   const deleteFAQ = async (id: string) => {
//     try {
//       setDeletingId(id);
//       await fetch(`/api/admin/faqs/${id}`, {
//         method: "DELETE",
//       });

//       setFaqs((prev) => prev.filter((f) => f.id !== id));
//       appToast.success("Success", "FAQ deleted successfully");
//     } catch (err) {
//       console.error(err);
//       appToast.error("Error", "Failed to delete FAQ ❌");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const handleDragEnd = async (event: any) => {
//     const { active, over } = event;

//     if (!over || active.id === over.id) return;

//     const oldIndex = faqs.findIndex((f) => f.id === active.id);
//     const newIndex = faqs.findIndex((f) => f.id === over.id);

//     const newItems = arrayMove(faqs, oldIndex, newIndex);

//     setFaqs(newItems); // ✅ instant UI update

//     // ✅ send new order to backend
//     await fetch("/api/admin/faqs/reorder", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         items: newItems.map((item, index) => ({
//           id: item.id,
//           order: index,
//         })),
//       }),
//     });

//     toast.success("Reordered ✅");
//   };

//   return (
//     <div className={`${loading ? "opacity-60 pointer-events-none" : ""}`}>
//       <div className="space-y-6">
//         {/* ADD FAQ */}
//         <div className="bg-white border rounded-xl p-4 space-y-3">
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="border p-2 rounded"
//           >
//             <option>General</option>
//             <option>Shipping</option>
//             <option>Payments</option>
//             <option>Returns</option>
//             <option>Orders</option>
//           </select>
//           <input
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Enter question..."
//             className="w-full border p-2 rounded"
//           />

//           <RichTextEditor value={answer} onChange={setAnswer} />

//           <button
//             onClick={addFAQ}
//             disabled={loading}
//             className={`
//             px-4 py-2 rounded text-white transition-all
//             ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"}
//             `}
//           >
//             {loading ? "Saving..." : "Add FAQ"}
//           </button>
//         </div>

//         {/* LIST */}
//         <div className="space-y-3">
//           {loadingFAG ? (
//             <div className="flex items-center justify-center py-10 text-gray-500">
//               <div className="animate-pulse flex items-center gap-2">
//                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
//                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
//                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
//                 <span className="ml-3">Loading FAQs...</span>
//               </div>
//             </div>
//           ) : faqs.length === 0 ? (
//             <div className="text-center text-gray-400 py-10">No FAQs found</div>
//           ) : (
//             <DndContext
//               sensors={sensors}
//               collisionDetection={closestCenter}
//               onDragEnd={handleDragEnd}
//             >
//               <SortableContext
//                 items={faqs.map((f) => f.id)}
//                 strategy={verticalListSortingStrategy}
//               >
//                 <div className="space-y-3">
//                   {faqs.map((faq) => (
//                     <SortableItem
//                       key={faq.id}
//                       faq={faq}
//                       openId={openId}
//                       setOpenId={setOpenId}
//                       onEdit={openEditModal}
//                       deleteFAQ={deleteFAQ}
//                       deletingId={deletingId}
//                     />
//                   ))}
//                 </div>
//               </SortableContext>
//             </DndContext>
//           )}
//         </div>
//       </div>
//       <FAQEditModal
//         open={isEditOpen}
//         onClose={() => setIsEditOpen(false)}
//         question={editQuestion}
//         setQuestion={setEditQuestion}
//         answer={editAnswer}
//         setAnswer={setEditAnswer}
//         onSave={saveEdit}
//         loading={loadingEdit}
//       />
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";

import RichTextEditor from "@/components/ui/rich-text-editor";

import SortableItem from "./sortableItem";
import FAQEditModal from "./FAQEditModal";

import { appToast } from "@/utils/appToast";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category?: string;
};

/*
|--------------------------------------------------------------------------
| Default FAQs
|--------------------------------------------------------------------------
|
| These FAQs are automatically created for a brand-new store when the
| store has no FAQs yet.
|
| Because they are created through the normal FAQ API, they become real
| database records and can therefore be edited, deleted and reordered.
|
*/

const DEFAULT_FAQS = [
  {
    question: "How can I place an order?",
    answer: `
      <p>
        To place an order, browse our products and select the item you
        would like to purchase. Choose the available options such as
        size, colour, or quantity where applicable, then add the item
        to your cart.
      </p>

      <p>
        Review your cart, proceed to checkout, provide your delivery
        information, select your preferred shipping method and complete
        your payment.
      </p>
    `,
    category: "Orders",
  },

  {
    question: "What payment methods do you accept?",
    answer: `
      <p>
        We accept the payment methods displayed during checkout.
        Available payment options may vary depending on your location
        and the payment providers available for your order.
      </p>

      <p>
        Your order will normally be processed after your payment has
        been successfully confirmed.
      </p>
    `,
    category: "Payments",
  },

  {
    question: "How long will it take to receive my order?",
    answer: `
      <p>
        Delivery times depend on your location, selected shipping method,
        product availability, and other delivery conditions.
      </p>

      <p>
        Estimated delivery information is provided during checkout where
        applicable. Delivery times may also be affected by weekends,
        public holidays, courier delays, weather, or other circumstances
        outside our control.
      </p>
    `,
    category: "Shipping",
  },

  {
    question: "How much does shipping cost?",
    answer: `
      <p>
        Shipping charges depend on your delivery location, selected
        shipping method, order details, and the shipping rates configured
        by the store.
      </p>

      <p>
        The applicable shipping cost will be displayed during checkout
        before you complete your order.
      </p>
    `,
    category: "Shipping",
  },

  {
    question: "Can I return an item?",
    answer: `
      <p>
        Eligible items may be returned in accordance with our Return &
        Refund Policy.
      </p>

      <p>
        If you need to request a return, please contact our support team
        with your order number and details of the reason for your request.
      </p>
    `,
    category: "Returns",
  },

  {
    question: "How do I request a refund?",
    answer: `
      <p>
        If you believe you are eligible for a refund, please contact our
        support team with your order details and the reason for your
        request.
      </p>

      <p>
        Refund requests are reviewed according to our Return & Refund
        Policy. Approved refunds are processed through the applicable
        payment method or refund process.
      </p>
    `,
    category: "Returns",
  },

  {
    question: "How can I contact customer support?",
    answer: `
      <p>
        If you need help with an order, product, payment, delivery,
        return, or any other issue, please contact our customer support
        team using the contact information provided on our website.
      </p>

      <p>
        When contacting us about an existing order, please include your
        order number so that we can assist you more efficiently.
      </p>
    `,
    category: "General",
  },
];

export default function FAQForm() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [loadingFAQ, setLoadingFAQ] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [category, setCategory] = useState("General");

  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const [openId, setOpenId] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  /*
  |--------------------------------------------------------------------------
  | Fetch FAQs
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoadingFAQ(true);

        const res = await fetch("/api/admin/faqs");

        if (!res.ok) {
          throw new Error("Failed to load FAQs");
        }

        const data = await res.json();

        /*
        |--------------------------------------------------------------------------
        | Existing FAQs
        |--------------------------------------------------------------------------
        |
        | If the store already has FAQs, use them exactly as they are.
        |
        */

        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Brand-new store
        |--------------------------------------------------------------------------
        |
        | There are no FAQs yet.
        |
        | Create the default FAQs through the normal API so they become
        | actual database records.
        |
        */

        const createdFaqs: FAQ[] = [];

        for (const defaultFaq of DEFAULT_FAQS) {
          const createRes = await fetch("/api/admin/faqs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(defaultFaq),
          });

          if (!createRes.ok) {
            throw new Error("Failed to create default FAQs");
          }

          const newFaq = await createRes.json();

          createdFaqs.push(newFaq);
        }

        setFaqs(createdFaqs);
      } catch (error) {
        console.error("Failed to load FAQs:", error);

        appToast.error("Error", "Failed to load FAQs.");
      } finally {
        setLoadingFAQ(false);
      }
    };

    fetchFaqs();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Open edit modal
  |--------------------------------------------------------------------------
  */

  const openEditModal = (faq: FAQ) => {
    setEditId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setIsEditOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Add FAQ
  |--------------------------------------------------------------------------
  */

  const addFAQ = async () => {
    if (!question.trim() || !answer.trim()) {
      appToast.warning(
        "Missing information",
        "Please enter both a question and an answer.",
      );

      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          answer,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add FAQ");
      }

      setFaqs((prev) => [data, ...prev]);

      setQuestion("");
      setAnswer("");
      setCategory("General");

      appToast.success("Success", "FAQ added successfully.");
    } catch (error) {
      console.error("Failed to add FAQ:", error);

      appToast.error(
        "Failed",
        error instanceof Error ? error.message : "Failed to add FAQ.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save FAQ edit
  |--------------------------------------------------------------------------
  */

  const saveEdit = async () => {
    if (!editId) {
      return;
    }

    if (!editQuestion.trim() || !editAnswer.trim()) {
      appToast.warning(
        "Missing information",
        "Please enter both a question and an answer.",
      );

      return;
    }

    setLoadingEdit(true);

    try {
      const res = await fetch(`/api/admin/faqs/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update FAQ");
      }

      setFaqs((prev) =>
        prev.map((faq) =>
          faq.id === editId
            ? {
                ...faq,
                question: editQuestion.trim(),
                answer: editAnswer,
              }
            : faq,
        ),
      );

      setIsEditOpen(false);
      setEditId(null);

      setEditQuestion("");
      setEditAnswer("");

      appToast.success("Success", "FAQ updated successfully.");
    } catch (error) {
      console.error("Failed to update FAQ:", error);

      appToast.error(
        "Update failed",
        error instanceof Error ? error.message : "Failed to update FAQ.",
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete FAQ
  |--------------------------------------------------------------------------
  */

  const deleteFAQ = async (id: string) => {
    try {
      setDeletingId(id);

      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete FAQ");
      }

      setFaqs((prev) => prev.filter((faq) => faq.id !== id));

      /*
      |--------------------------------------------------------------------------
      | If the deleted FAQ was open, close it.
      |--------------------------------------------------------------------------
      */

      if (openId === id) {
        setOpenId(null);
      }

      appToast.success("Success", "FAQ deleted successfully.");
    } catch (error) {
      console.error("Failed to delete FAQ:", error);

      appToast.error(
        "Error",
        error instanceof Error ? error.message : "Failed to delete FAQ.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reorder FAQs
  |--------------------------------------------------------------------------
  */

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = faqs.findIndex((faq) => faq.id === active.id);

    const newIndex = faqs.findIndex((faq) => faq.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newItems = arrayMove(faqs, oldIndex, newIndex);

    /*
    |--------------------------------------------------------------------------
    | Update UI immediately
    |--------------------------------------------------------------------------
    */

    setFaqs(newItems);

    try {
      const res = await fetch("/api/admin/faqs/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: newItems.map((item, index) => ({
            id: item.id,
            order: index,
          })),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save FAQ order");
      }

      appToast.success("Success", "FAQ order updated.");
    } catch (error) {
      console.error("Failed to reorder FAQs:", error);

      /*
      |--------------------------------------------------------------------------
      | Revert UI if backend update failed
      |--------------------------------------------------------------------------
      */

      setFaqs(arrayMove(newItems, newIndex, oldIndex));

      appToast.error("Error", "Failed to save FAQ order.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className={loading ? "opacity-60 pointer-events-none" : ""}>
      <div className="space-y-6">
        {/* ------------------------------------------------ */}
        {/* ADD FAQ */}
        {/* ------------------------------------------------ */}

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="General">General</option>

            <option value="Shipping">Shipping</option>

            <option value="Payments">Payments</option>

            <option value="Returns">Returns</option>

            <option value="Orders">Orders</option>
          </select>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter question..."
            className="w-full border p-2 rounded"
          />

          <RichTextEditor value={answer} onChange={setAnswer} />

          <button
            type="button"
            onClick={addFAQ}
            disabled={loading}
            className={`
              px-4
              py-2
              rounded
              text-white
              transition-all
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }
            `}
          >
            {loading ? "Saving..." : "Add FAQ"}
          </button>
        </div>

        {/* ------------------------------------------------ */}
        {/* FAQ LIST */}
        {/* ------------------------------------------------ */}

        <div className="space-y-3">
          {loadingFAQ ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />

                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />

                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />

                <span className="ml-3">Loading FAQs...</span>
              </div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-gray-50 px-6 py-12 text-center">
              <p className="text-sm font-semibold text-gray-800">No FAQs yet</p>

              <p className="mt-1 text-sm text-gray-500">
                Add frequently asked questions to help customers find answers
                quickly.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={faqs.map((faq) => faq.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <SortableItem
                      key={faq.id}
                      faq={faq}
                      openId={openId}
                      setOpenId={setOpenId}
                      onEdit={openEditModal}
                      deleteFAQ={deleteFAQ}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* EDIT FAQ MODAL */}
      {/* -------------------------------------------------- */}

      <FAQEditModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditId(null);
        }}
        question={editQuestion}
        setQuestion={setEditQuestion}
        answer={editAnswer}
        setAnswer={setEditAnswer}
        onSave={saveEdit}
        loading={loadingEdit}
      />
    </div>
  );
}
