
import Navbar from "@/components/navbar/Navbar";
import SearchFilter from "@/components/findpetsitter/SearchFilter";



function FindPetsitter() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container-1200 py-8">
        <div className="flex gap-8">
          <SearchFilter 
            onSearch={() => {}}
            onClear={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
export default FindPetsitter;
