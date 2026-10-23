#include <stdio.h>
#include <stdlib.h>

#define N 5

char vertex[N] = {'A', 'B', 'C', 'D', 'E'};

struct Node
{
    int row;
    int col;
    int value;
    struct Node *next;
};

struct Node *head = NULL;


struct Node *findNode(int row, int col)
{
    struct Node *temp = head;

    while (temp != NULL)
    {
        if (temp->row == row && temp->col == col)
            return temp;

        temp = temp->next;
    }

    return NULL;
}


int readRoad(int *from, int *to)
{
    char a, b;

    printf("Enter starting intersection (A-E): ");
    scanf(" %c", &a);

    printf("Enter ending intersection (A-E): ");
    scanf(" %c", &b);

    if (a >= 'a' && a <= 'e')
        a = a - 32;

    if (b >= 'a' && b <= 'e')
        b = b - 32;

    if (a < 'A' || a > 'E' || b < 'A' || b > 'E' || a == b)
    {
        printf("Invalid intersections!\n");
        return 0;
    }

    *from = a - 'A';
    *to = b - 'A';

    return 1;
}


void insertRoad()
{
    int from, to, distance;
    struct Node *newNode, *temp;

    if (!readRoad(&from, &to))
        return;

    if (findNode(from, to) != NULL)
    {
        printf("Road already exists!\n");
        return;
    }

    printf("Enter distance in km: ");
    scanf("%d", &distance);

    if (distance <= 0)
    {
        printf("Distance must be positive!\n");
        return;
    }

    newNode = (struct Node *)malloc(sizeof(struct Node));

    if (newNode == NULL)
    {
        printf("Memory allocation failed!\n");
        return;
    }

    newNode->row = from;
    newNode->col = to;
    newNode->value = distance;
    newNode->next = NULL;

    if (head == NULL)
        head = newNode;
    else
    {
        temp = head;

        while (temp->next != NULL)
            temp = temp->next;

        temp->next = newNode;
    }

    newNode = (struct Node *)malloc(sizeof(struct Node));

    if (newNode == NULL)
    {
        printf("Memory allocation failed!\n");
        return;
    }

    newNode->row = to;
    newNode->col = from;
    newNode->value = distance;
    newNode->next = NULL;

    temp = head;

    while (temp->next != NULL)
        temp = temp->next;

    temp->next = newNode;

    printf("Road inserted successfully!\n");
}


void updateRoad()
{
    int from, to, distance;
    struct Node *road, *reverseRoad;

    if (!readRoad(&from, &to))
        return;

    road = findNode(from, to);

    if (road == NULL)
    {
        printf("Road not found!\n");
        return;
    }

    printf("Enter new distance in km: ");
    scanf("%d", &distance);

    if (distance <= 0)
    {
        printf("Distance must be positive!\n");
        return;
    }

    road->value = distance;

    reverseRoad = findNode(to, from);

    if (reverseRoad != NULL)
        reverseRoad->value = distance;

    printf("Road updated successfully!\n");
}


void deleteRoad()
{
    int from, to;
    struct Node *temp, *previous;

    if (!readRoad(&from, &to))
        return;

    if (findNode(from, to) == NULL)
    {
        printf("Road not found!\n");
        return;
    }

    temp = head;
    previous = NULL;

    while (temp != NULL)
    {
        if (temp->row == from && temp->col == to)
        {
            if (previous == NULL)
                head = temp->next;
            else
                previous->next = temp->next;

            free(temp);
            break;
        }

        previous = temp;
        temp = temp->next;
    }

    temp = head;
    previous = NULL;

    while (temp != NULL)
    {
        if (temp->row == to && temp->col == from)
        {
            if (previous == NULL)
                head = temp->next;
            else
                previous->next = temp->next;

            free(temp);
            break;
        }

        previous = temp;
        temp = temp->next;
    }

    printf("Road deleted successfully!\n");
}


void searchRoad()
{
    int from, to;
    struct Node *road;

    if (!readRoad(&from, &to))
        return;

    road = findNode(from, to);

    if (road == NULL)
        printf("Road not found!\n");
    else
        printf("Road found! Distance = %d km\n", road->value);
}


void displayMatrix()
{
    int matrix[N][N] = {0};
    int i, j;
    struct Node *temp = head;

    while (temp != NULL)
    {
        matrix[temp->row][temp->col] = temp->value;
        temp = temp->next;
    }

    printf("\nADJACENCY MATRIX\n\n   ");

    for (i = 0; i < N; i++)
        printf("%4c", vertex[i]);

    printf("\n");

    for (i = 0; i < N; i++)
    {
        printf("%c  ", vertex[i]);

        for (j = 0; j < N; j++)
            printf("%4d", matrix[i][j]);

        printf("\n");
    }
}


void displayTriplets()
{
    struct Node *temp = head;

    printf("\nCOO TRIPLETS (Row, Column, Value)\n");
    printf("Row  Column  Distance\n");

    while (temp != NULL)
    {
        printf(" %c      %c       %d km\n",
               vertex[temp->row],
               vertex[temp->col],
               temp->value);

        temp = temp->next;
    }
}


void displayLinkedList()
{
    struct Node *temp = head;

    printf("\nLINKED LIST\n");

    while (temp != NULL)
    {
        printf("(%c, %c, %d) -> ",
               vertex[temp->row],
               vertex[temp->col],
               temp->value);

        temp = temp->next;
    }

    printf("NULL\n");
}


void displayAll()
{
    displayMatrix();
    displayTriplets();
    displayLinkedList();
}


void initializeNetwork()
{
    int roads[4][3] = {
        {0, 1, 5},
        {1, 2, 3},
        {2, 3, 7},
        {3, 4, 2}
    };

    int i;
    struct Node *newNode, *temp;

    for (i = 0; i < 4; i++)
    {
        newNode = (struct Node *)malloc(sizeof(struct Node));

        if (newNode == NULL)
            return;

        newNode->row = roads[i][0];
        newNode->col = roads[i][1];
        newNode->value = roads[i][2];
        newNode->next = NULL;

        if (head == NULL)
            head = newNode;
        else
        {
            temp = head;

            while (temp->next != NULL)
                temp = temp->next;

            temp->next = newNode;
        }

        newNode = (struct Node *)malloc(sizeof(struct Node));

        if (newNode == NULL)
            return;

        newNode->row = roads[i][1];
        newNode->col = roads[i][0];
        newNode->value = roads[i][2];
        newNode->next = NULL;

        temp = head;

        while (temp->next != NULL)
            temp = temp->next;

        temp->next = newNode;
    }
}


int main()
{
    int choice;

    initializeNetwork();

    do
    {
        printf("\n===== SPARSE ROAD NETWORK =====\n");
        printf("1. Display Adjacency Matrix\n");
        printf("2. Display COO Triplets\n");
        printf("3. Display Linked List\n");
        printf("4. Insert Road\n");
        printf("5. Update Road\n");
        printf("6. Delete Road\n");
        printf("7. Search Road\n");
        printf("8. Exit\n");

        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice)
        {
            case 1:
                displayMatrix();
                break;

            case 2:
                displayTriplets();
                break;

            case 3:
                displayLinkedList();
                break;

            case 4:
                insertRoad();
                displayAll();
                break;

            case 5:
                updateRoad();
                displayAll();
                break;

            case 6:
                deleteRoad();
                displayAll();
                break;

            case 7:
                searchRoad();
                displayAll();
                break;

            case 8:
                printf("Exiting program...\n");
                break;

            default:
                printf("Invalid choice!\n");
        }

    } while (choice != 8);

    while (head != NULL)
    {
        struct Node *temp = head;
        head = head->next;
        free(temp);
    }

    return 0;
}
