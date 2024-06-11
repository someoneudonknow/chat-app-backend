using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaiTap3
{
	class Cau8
	{
		public static void cau8()
		{
			Console.Write("Nhập chiều dài: ");
			int w = int.Parse(Console.ReadLine());
			Console.Write("Nhập chiều rộng: ");
			int h = int.Parse(Console.ReadLine());

			Console.WriteLine("Chon loai hinh muon ve");
			Console.WriteLine("1. Hinh Chu Nhat Dac");
			Console.WriteLine("2. Hinh Chu Nhat Rong");
			Console.Write("Nhap lua chon: ");
			int choice = Convert.ToInt32(Console.ReadLine());

			switch (choice)
			{
				case 1:
					veHinhChuNhatDac(w, h);
					break;
				case 2:
					veHinhChuNhatRong(w, h);
					break;
			}
		}

		public static void veHinhChuNhatDac(int w, int h)
		{
			for (int i = 0; i < h; i++)
			{
				for (int j = 0; j < w; j++)
				{
					Console.Write("*");
				}
				Console.WriteLine();
			}
		}

		public static void veHinhChuNhatRong(int w, int h)
		{
			for (int i = 0; i < h; i++)
			{
				for (int j = 0; j < w; j++)
				{
					if (i == 0 || i == h - 1 || j == 0 || j == w - 1)
					{
						Console.Write("*");
					}
					else
					{
						Console.Write(" ");
					}
				}
				Console.WriteLine();
			}
		}

	}
}
