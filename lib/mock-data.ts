import { AddressData, ImageData } from "./types";

// Mock data simulating Google Drive folder structure
// Each address folder contains 4-5 street view images

const generateImageUrl = (seed: number) => 
  `https://picsum.photos/seed/${seed}/800/600`;

export const mockAddresses: AddressData[] = [
  {
    id: "addr_1",
    name: "123_Main_Street_San_Francisco_CA",
    displayName: "123 Main Street, San Francisco, CA",
    images: [
      { id: "img_1_1", name: "street_view_1.jpg", url: generateImageUrl(101), addressId: "addr_1" },
      { id: "img_1_2", name: "street_view_2.jpg", url: generateImageUrl(102), addressId: "addr_1" },
      { id: "img_1_3", name: "street_view_3.jpg", url: generateImageUrl(103), addressId: "addr_1" },
      { id: "img_1_4", name: "street_view_4.jpg", url: generateImageUrl(104), addressId: "addr_1" },
    ],
  },
  {
    id: "addr_2",
    name: "456_Oak_Avenue_Los_Angeles_CA",
    displayName: "456 Oak Avenue, Los Angeles, CA",
    images: [
      { id: "img_2_1", name: "street_view_1.jpg", url: generateImageUrl(201), addressId: "addr_2" },
      { id: "img_2_2", name: "street_view_2.jpg", url: generateImageUrl(202), addressId: "addr_2" },
      { id: "img_2_3", name: "street_view_3.jpg", url: generateImageUrl(203), addressId: "addr_2" },
      { id: "img_2_4", name: "street_view_4.jpg", url: generateImageUrl(204), addressId: "addr_2" },
      { id: "img_2_5", name: "street_view_5.jpg", url: generateImageUrl(205), addressId: "addr_2" },
    ],
  },
  {
    id: "addr_3",
    name: "789_Pine_Boulevard_Seattle_WA",
    displayName: "789 Pine Boulevard, Seattle, WA",
    images: [
      { id: "img_3_1", name: "street_view_1.jpg", url: generateImageUrl(301), addressId: "addr_3" },
      { id: "img_3_2", name: "street_view_2.jpg", url: generateImageUrl(302), addressId: "addr_3" },
      { id: "img_3_3", name: "street_view_3.jpg", url: generateImageUrl(303), addressId: "addr_3" },
      { id: "img_3_4", name: "street_view_4.jpg", url: generateImageUrl(304), addressId: "addr_3" },
    ],
  },
  {
    id: "addr_4",
    name: "321_Elm_Drive_Portland_OR",
    displayName: "321 Elm Drive, Portland, OR",
    images: [
      { id: "img_4_1", name: "street_view_1.jpg", url: generateImageUrl(401), addressId: "addr_4" },
      { id: "img_4_2", name: "street_view_2.jpg", url: generateImageUrl(402), addressId: "addr_4" },
      { id: "img_4_3", name: "street_view_3.jpg", url: generateImageUrl(403), addressId: "addr_4" },
      { id: "img_4_4", name: "street_view_4.jpg", url: generateImageUrl(404), addressId: "addr_4" },
      { id: "img_4_5", name: "street_view_5.jpg", url: generateImageUrl(405), addressId: "addr_4" },
    ],
  },
  {
    id: "addr_5",
    name: "555_Market_Street_Denver_CO",
    displayName: "555 Market Street, Denver, CO",
    images: [
      { id: "img_5_1", name: "street_view_1.jpg", url: generateImageUrl(501), addressId: "addr_5" },
      { id: "img_5_2", name: "street_view_2.jpg", url: generateImageUrl(502), addressId: "addr_5" },
      { id: "img_5_3", name: "street_view_3.jpg", url: generateImageUrl(503), addressId: "addr_5" },
      { id: "img_5_4", name: "street_view_4.jpg", url: generateImageUrl(504), addressId: "addr_5" },
    ],
  },
  {
    id: "addr_6",
    name: "888_Broadway_New_York_NY",
    displayName: "888 Broadway, New York, NY",
    images: [
      { id: "img_6_1", name: "street_view_1.jpg", url: generateImageUrl(601), addressId: "addr_6" },
      { id: "img_6_2", name: "street_view_2.jpg", url: generateImageUrl(602), addressId: "addr_6" },
      { id: "img_6_3", name: "street_view_3.jpg", url: generateImageUrl(603), addressId: "addr_6" },
      { id: "img_6_4", name: "street_view_4.jpg", url: generateImageUrl(604), addressId: "addr_6" },
      { id: "img_6_5", name: "street_view_5.jpg", url: generateImageUrl(605), addressId: "addr_6" },
    ],
  },
  {
    id: "addr_7",
    name: "100_First_Avenue_Boston_MA",
    displayName: "100 First Avenue, Boston, MA",
    images: [
      { id: "img_7_1", name: "street_view_1.jpg", url: generateImageUrl(701), addressId: "addr_7" },
      { id: "img_7_2", name: "street_view_2.jpg", url: generateImageUrl(702), addressId: "addr_7" },
      { id: "img_7_3", name: "street_view_3.jpg", url: generateImageUrl(703), addressId: "addr_7" },
      { id: "img_7_4", name: "street_view_4.jpg", url: generateImageUrl(704), addressId: "addr_7" },
    ],
  },
  {
    id: "addr_8",
    name: "200_Lake_Shore_Drive_Chicago_IL",
    displayName: "200 Lake Shore Drive, Chicago, IL",
    images: [
      { id: "img_8_1", name: "street_view_1.jpg", url: generateImageUrl(801), addressId: "addr_8" },
      { id: "img_8_2", name: "street_view_2.jpg", url: generateImageUrl(802), addressId: "addr_8" },
      { id: "img_8_3", name: "street_view_3.jpg", url: generateImageUrl(803), addressId: "addr_8" },
      { id: "img_8_4", name: "street_view_4.jpg", url: generateImageUrl(804), addressId: "addr_8" },
      { id: "img_8_5", name: "street_view_5.jpg", url: generateImageUrl(805), addressId: "addr_8" },
    ],
  },
];

export const getTotalImages = (addresses: AddressData[]): number => {
  return addresses.reduce((sum, addr) => sum + addr.images.length, 0);
};
