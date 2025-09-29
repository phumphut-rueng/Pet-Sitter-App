
// import Image from "next/image";
// import { Rating } from "./PetSitterCard";

// export default function ReviewsSection() {
//   const reviews = [
//     {
//       id: 1,
//       name: "Emily B.",
//       date: "Aug 16, 2023",
//       rating: 5,
//       text: "I cannot express how grateful I am to have found Jane Maison as a pet sitter for my cat, Whiskers. Jane took the time to understand Whiskers' routines, likes, and quirks. During my recent vacation, she provided regular updates, including photos of Whiskers playing, lounging, and even eating his favorite treats. It was evident that Whiskers was not only well-cared for but was also enjoying his time with Jane.",
//       avatar: "" // ไม่มีรูป
//     },
//     {
//       id: 2,
//       name: "Emily B.",
//       date: "Aug 16, 2023",
//       rating: 3,
//       text: "Jane Maison did a great job looking after my energetic dog, Buddy. While I was away, she made sure Buddy got his exercise and kept up with his feeding schedule. I appreciated the updates she sent, although I would have liked a bit more frequent communication. Overall, I'm satisfied with her service and would consider using her again in the future.",
//       avatar: "/images/sitters/test1.svg"
//     },
//   ];

//   return (
//     <div className="divide-y divide-gray-2">
//     {reviews.map((review) => (
//       <div key={review.id} className="flex space-x-6 p-6 bg-gray-1">
//         {/* Left box */}
//         <div className="w-56 flex flex-row items-start space-y-2 gap-4">
//           {review.avatar ? (
//             <div className="w-14 h-14 rounded-full overflow-hidden relative">
//                       <Image
//                         src={review.avatar}
//                         alt={review.name}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//           ) : (
//             <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
//               {review.name.charAt(0)}
//             </div>
//           )}
//           <div className="pt-1">
//             <p className="font-medium text-lg text-ink">{review.name}</p>
//             <p className="font-medium text-sm text-gray-6">{review.date}</p>
//           </div>
//         </div>

//         {/* Right box */}
//         <div className="flex-1">
//           <Rating value={review.rating} size="md"/>
//           <p className="mt-3 text-base font-medium text-gray-7 leading-relaxed">{review.text}</p>
//         </div>
//       </div>
//     ))}
//   </div>
// );
// }
