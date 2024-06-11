#include <stdio.h> 
int main(){
int x, y;
printf("nhap gia tri x va y\n: ");
scanf("%d%d",&x,&y);
do {
	  int t= x;      
        x= y;
        y= t;
    printf("x sau khi doi la:%d\n",x);
    printf("y sau khi doi la:%d",y);
}
while (x!=0 && y!=0);
if (x==y)
printf("gia tri x va y giong nhau");
   getchar();
   return 0;
}

