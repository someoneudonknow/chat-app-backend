using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaiTap3
{
	class Cau9
	{
		public static void cau9()
		{
			Console.Write("Nhập h: ");
			int h = int.Parse(Console.ReadLine());

			cau9_1(h);
			Console.WriteLine();
			cau9_2(h);
			Console.WriteLine();
			cau9_3(h);
			cau9_4(h);
			cau9_5(h);
			Console.WriteLine();
			Cau8.veHinhChuNhatDac(h, h);
			Console.WriteLine();
			Cau8.veHinhChuNhatRong(h, h);
			Console.WriteLine();
			cau9_1(h);
			Console.WriteLine();
			cau9_8(h);
			Console.WriteLine();
			cau9_4(h);
			Console.WriteLine();
			cau9_10(h);
			Console.WriteLine();
			cau9_11(h);
			Console.WriteLine();
			cau9_12(h);
			Console.WriteLine();
			cau9_13(h);
			cau9_14(h);
		}

		static void cau9_1(int h)
		{
			for (int i = 0; i < h; i++)
			{
				for (int j = 0; j <= i; j++)
				{
					Console.Write("*");
				}
				Console.WriteLine();
			}
		}

		static void cau9_2(int h)
		{
			for (int i = 0; i < h; i++)
			{
				for (int j = 0; j < h; j++)
				{
					if (j >= h - i - 1)
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

		static void cau9_3(int h)
		{
			for (int i = h; i >= 0; i--)
			{
				for (int j = 0; j < h; j++)
				{
					if (j < h - i)
					{
						Console.Write(" ");
					}
					else
					{
						Console.Write("*");
					}
				}
				Console.WriteLine();
			}
		}

		static void cau9_4(int h)
		{
			for (int i = h; i > 0; i--)
			{
				for (int j = 0; j < i; j++)
				{
					Console.Write("*");
				}
				Console.WriteLine();
			}
		}

		static void cau9_5(int h)
		{
			for (int i = 0; i <= h; i++)
			{
				for (int j = 0; j < h * 2; j++)
				{
					if (j > h - i - 1 && j < h * 2 - h + i - 1)
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

		static void cau9_8(int h)
		{
			for (int i = 0; i < h; i++)
			{
				for (int j = 0; j <= i; j++)
				{
					if (i == 0 || i == h - 1 || j == i || j == 0)
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

		static void cau9_10(int h)
		{
			for (int i = 0; i < h; i++)
			{
				for (int j = 0; j < h; j++)
				{
					if (j == 0 || i == 0 || j == h - i - 1) Console.Write("*");
					else Console.Write(" ");
				}
				Console.WriteLine();
			}
		}

		static void cau9_11(int h)
		{
			for (int i = 0; i < h * 2; i++)
			{
				for (int j = 0; j < h; j++)
				{
					if ((i < h && j <= i) || (i >= h && j > i - h)) Console.Write("*");
					else Console.Write(" ");
				}
				Console.WriteLine();
			}
		}

		static void cau9_12(int h)
		{
			for (int i = 0; i < h * 2 - 1; i++)
			{
				for (int j = 0; j < h; j++)
				{
					if ((i < h && (j == i || j == 0)) || (i >= h && (j == i - h + 1 || j == h - 1))) Console.Write("*");
					else Console.Write(" ");
				}
				Console.WriteLine();
			} 
		}

		static void cau9_13(int h)
		{
			for (int i = 0; i < h * 2 - 1; i++)
			{
				for (int j = 0; j < h * 2 - 1  ; j++)
				{
					if (i < h && j <= i)
					{
						if (j <= i || j == h - 1) Console.Write("*");
						else Console.Write(" ");
					}
					else if (i >= h - 1 && j >= h)
					{

						if (j >= h + (i - h))
						{
							Console.Write("*");
						}
						else
						{
							Console.Write(" ");
						}
					}
					else
					{
						Console.Write(" ");
					}
				}
				Console.WriteLine();
			}
		}

		static void cau9_14(int h)
		{
			for (int i = 0; i < h * 2 - 1; i++)
			{
				for (int j = 0; j < h * 2 - 1; j++)
				{
					if (j == i) Console.Write("*");
					else if ((i < h && j == 0) || (i >= h && j == h * 2 - 2)) Console.Write("*");
					else if (i == h-1) Console.Write("*");
					else Console.Write(" ");
				}
				Console.WriteLine();
			}
		}
	}
}
