export class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  prev: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  head: ListNode<T> | null = null;
  tail: ListNode<T> | null = null;
  size: number = 0;

  // Adiciona um elemento no final da lista
  append(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      if (this.tail) this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  // Adiciona um elemento no início da lista
  prepend(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  // Remove um elemento da lista pelo valor
  remove(value: T): boolean {
    if (!this.head) return false;

    let current: ListNode<T> | null = this.head;

    while (current) {
      if (current.value === value) {
        if (current.prev) current.prev.next = current.next;
        if (current.next) current.next.prev = current.prev;

        if (current === this.head) this.head = current.next;
        if (current === this.tail) this.tail = current.prev;

        this.size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  // Procura um elemento na lista
  find(value: T): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  // Procura um elemento na lista começando pelo final
  findLast(value: T): ListNode<T> | null {
    let current = this.tail;
    while (current) {
      if (current.value === value) return current;
      current = current.prev;
    }
    return null;
  }

  // Converte a lista em um array
  toArray(): T[] {
    const elements: T[] = [];
    let current = this.head;
    while (current) {
      elements.push(current.value);
      current = current.next;
    }
    return elements;
  }

  // Obtém o tamanho da lista
  getSize(): number {
    return this.size;
  }

  // Verifica se a lista está vazia
  isEmpty(): boolean {
    return this.size === 0;
  }

  // Clone method to create a deep copy of the list
  clone(): LinkedList<T> {
    const newList = new LinkedList<T>();
    let current = this.head;

    while (current) {
      newList.append(current.value); // Copying only the value, not the reference
      current = current.next;
    }

    return newList;
  }

  // Converts the linked list into a string representation
  toString(): string {
    const listNodes = this.toArray().map(value => value.toString())
    return listNodes.join("  ->  ");
  }
}