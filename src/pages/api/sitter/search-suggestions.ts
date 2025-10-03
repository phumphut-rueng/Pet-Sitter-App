import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    const searchTerm = q.trim().toLowerCase();

    // ค้นหาจากชื่อ pet sitter, user name, location description, และ address
    const suggestions = await prisma.sitter.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            user: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            address_district: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            address_province: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        name: true,
        address_district: true,
        address_province: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      take: 10,
    });

    // แปลงข้อมูลเป็น suggestions
    const formattedSuggestions = suggestions.map((sitter) => {
      // ตรวจสอบว่า searchTerm อยู่ใน field ไหน
      if (sitter.name.toLowerCase().includes(searchTerm)) {
        return sitter.name;
      }
      if (sitter.user?.name && sitter.user.name.toLowerCase().includes(searchTerm)) {
        return sitter.user.name;
      }
      if (sitter.address_district && sitter.address_district.toLowerCase().includes(searchTerm)) {
        const province = sitter.address_province || '';
        return province ? `${sitter.address_district}, ${province}` : sitter.address_district;
      }
      if (sitter.address_province && sitter.address_province.toLowerCase().includes(searchTerm)) {
        return sitter.address_province;
      }
      return sitter.name;
    });

    // ลบ duplicates และจำกัด 5 ตัว
    const uniqueSuggestions = [...new Set(formattedSuggestions)].slice(0, 5);

    res.status(200).json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
