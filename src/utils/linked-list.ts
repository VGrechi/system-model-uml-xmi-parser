class ListNode<T> {
    value: T;
    next: ListNode<T> | null = null;
  
    constructor(value: T) {
      this.value = value;
    }
}
  
export class LinkedList<T> {
    private head: ListNode<T> | null = null;
    private tail: ListNode<T> | null = null;
    private size: number = 0;
  
    // Adiciona um elemento no final da lista
    append(value: T): void {
      const newNode = new ListNode(value);
      if (!this.head) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        if (this.tail) this.tail.next = newNode;
        this.tail = newNode;
      }
      this.size++;
    }
  
    // Adiciona um elemento no início da lista
    prepend(value: T): void {
      const newNode = new ListNode(value);
      newNode.next = this.head;
      this.head = newNode;
      if (!this.tail) this.tail = newNode;
      this.size++;
    }
  
    // Remove um elemento da lista pelo valor
    remove(value: T): boolean {
      if (!this.head) return false;
  
      // Se o valor estiver no head
      if (this.head.value === value) {
        this.head = this.head.next;
        if (!this.head) this.tail = null;
        this.size--;
        return true;
      }
  
      let current = this.head;
      while (current.next) {
        if (current.next.value === value) {
          current.next = current.next.next;
          if (!current.next) this.tail = current; // Atualiza a cauda se necessário
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