using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BaiTap3
{
	class Cau10
	{
		public static void cau10()
		{
			Random rd = new Random();
			int ran = 7;
			int guessCount = 0;

			while (guessCount <= 7)
			{
				if (guessCount == 7)
				{
					Console.WriteLine("Bạn đã thua rồi, số máy là: {0}", ran);
					break;
				}
				Console.Write("Nhap so du doan: ");
				int guessNum = int.Parse(Console.ReadLine());

				if (guessNum == ran)
				{
					Console.ForegroundColor = ConsoleColor.Red;
					Console.WriteLine("Ha ha bạn tài thật");
					Console.ResetColor();
					break;
				}
				else
				{
					if (guessNum > ran)
					{
						Console.WriteLine("So ban lon hon so may.");
					}
					else
					{
						Console.WriteLine("So ban nho hon so may");
					}
					guessCount++;
				}
			}

		}
	}
}
