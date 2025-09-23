import Sidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { StatusBadge } from "@/components/badges/StatusBadge";
import PrimaryButton from "@/components/buttons/primaryButton";
import AvatarUploader from "@/components/form/AvatarUpload";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import PetTypeSelect from "@/components/fields/PetTypeSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import Image from "next/image";

export default function PetSitterProfilePage() {
  const [petTypes, setPetTypes] = useState<string[]>([]);

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <aside className="min-w-0">
        <Sidebar />
      </aside>
      <section className="flex-1 min-w-0">
        <PetSitterNavbar
          avatarUrl="/images/cards/jane-maison.svg"
          name="Jane Maison"
        />
        <div className="mr-auto px-6 py-8">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-gray-9 font-semibold text-2xl">
                Pet Sitter Profile
              </h3>
              <StatusBadge status="approved" className="font-medium" />
            </div>
            <div>
              <PrimaryButton
                text="Update"
                type="submit"
                bgColor="primary"
                textColor="white"
              />
            </div>
          </div>

          {/* basic information */}
          <section className="bg-white rounded-xl pt-4 pb-7 px-12 mt-4">
            <h4 className="text-gray-4 font-bold text-xl py-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1">
              <div className="pb-4 col-span-1">
                <p className="pb-4 font-medium text-black">Profile Image</p>
                <AvatarUploader />
              </div>
              <div className="md:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputText
                    label="Your full name*"
                    type="text"
                    variant="default"
                    className="w-full"
                  />

                  {/* Experience เป็น dropdown */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="experience"
                      className="text-[16px] font-medium text-black"
                    >
                      Experience*
                    </label>
                    <Select>
                      <SelectTrigger className="w-full rounded-xl !h-12 px-4 py-2 border border-gray-2">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-2">
                        <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                        <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                        <SelectItem value="5+ Years">5+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InputText
                    label="Phone Number*"
                    type="tel"
                    variant="default"
                    className="w-full"
                  />
                  <InputText
                    label="Email*"
                    type="email"
                    variant="default"
                    className="w-full"
                  />
                  <div className="md:col-span-2">
                    <InputTextArea
                      label="Introduction (Describe about yourself as pet sitter)"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* pet sitter */}
          <section className="bg-white rounded-xl py-4 px-12 mt-4 pb-7">
            <h4 className="text-gray-4 font-bold text-xl py-4">Pet Sitter</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <InputText
                  label="Pet sitter name (Trade Name)*"
                  type="text"
                  variant="default"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[16px] font-medium text-black mb-2">
                  Pet type
                </label>
                <PetTypeSelect value={petTypes} onChange={setPetTypes} />
              </div>
              <div className="col-span-2">
                <InputTextArea label="Services (Describe all of your service for pet sitting)" />
              </div>
              <div className="col-span-2">
                <InputTextArea label="My Place (Describe you place)" />
              </div>
              <div className="col-span-2">
                <p className="font-medium text-black pb-4">
                  Image Gellery (Maximum 10 images)
                </p>
                <ImageGallery />
              </div>
            </div>
          </section>

          {/* address */}
          <section className="bg-white rounded-xl py-4 px-12 mt-4 pb-7">
            <h4 className="text-gray-4 font-bold text-xl pt-4">Address</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* Address detail เต็มแถว */}
              <div className="md:col-span-2">
                <InputText
                  label="Address detail*"
                  type="text"
                  variant="default"
                />
              </div>

              {/* District */}
              <div>
                <label
                  htmlFor="district"
                  className="font-medium text-black"
                >
                  District*
                </label>
                <Select>
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left"
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-district */}
              <div>
                <label
                  htmlFor="subdistrict"
                  className="font-medium text-black"
                >
                  Sub-district*
                </label>
                <Select>
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left"
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Province */}
              <div>
                <label
                  htmlFor="province"
                  className="font-medium text-black"
                >
                  Province*
                </label>
                <Select>
                  <SelectTrigger className="!h-12 w-full rounded-xl border border-gray-2 px-4 text-left"
                  >
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-2">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <InputText
                  label="Post code*"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  variant="default"
                />
              </div>

              <div className="md:col-span-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-2 bg-gray-1">
                  <Image
                    src="/images/map.svg"
                    alt="Map preview"
                    fill
                    className="object-cover"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
