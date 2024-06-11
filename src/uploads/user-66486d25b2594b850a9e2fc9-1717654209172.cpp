#include <stdio.h>
#include <math.h>

int getUserChoice()
{
    int choice;
    printf("\n==================================================\n");
    printf("\n ________________MENU WS4 P2________________");
    printf("\n|                                             |");
    printf("\n| - Fibonacci sequence. ------------- Press 1 |");
    printf("\n| - Check a date. ------------------- Press 2 |");
    printf("\n| - Quit. --------------------------- Press 3 |");
    printf("\n|_____________________________________________|");
    printf("\n  || ");
    printf("\n  ++-->INPUT YOUR CHOICE: "); scanf("%d%*c", &choice);
    return choice;
}

int fibo(){
	 int n;
     printf("Nhap n: ");
     scanf("%d",&n);
     int f,f1,f2;
     f=f1=f2=1;
     for(int i=3;i<=n;i++){
        f=f1+f2;
        f1=f2;
        f2=f;
     }
     printf("F(%d) = %d",n,f);
     return 0;
}

int validDate (){
	int d,m,y;
    int maxd = 31; {
	if (d<1 || d>31 || m<1 || m>12) 
	return 0;
	if (m==4 || m==6 || m==9 || m==11) maxd=30;
	else if (m==2){
    if (y%400==0 || y%4==0 && y%100!=0) maxd=29;
    else maxd=28;}
	return d<=maxd; 
	}
	printf("input day month and year: ");
	scanf("%d%d%d",&d,&m,&y);
	if (validDate()==1)
	printf("valid date");
	else printf("invalid date");
}
int main()
{
    int userChoice;
    do
    {
        userChoice = getUserChoice();
        switch(userChoice)
        {
            case 1: fibo(); break;
            case 2: validDate(); break;
            case 3: 
            {
                printf("\n - PP - \n");
                printf("\n==================================================\n");
            }
        }
    }
    while(userChoice>0 && userChoice<3);
    return 0;
}
