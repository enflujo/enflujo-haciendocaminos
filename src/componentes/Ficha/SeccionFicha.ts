export default class SeccionFicha extends HTMLElement {
  lista: HTMLUListElement;

  constructor() {
    super();
    this.lista = this.querySelector<HTMLUListElement>('.contenido') as HTMLUListElement;
  }

  agregarElemento(elemento: HTMLElement) {
    this.lista.appendChild(elemento);
  }

  limpiar() {
    this.lista.innerHTML = '';
  }

  mostrar() {
    this.classList.add('visible');
  }

  esconder() {
    this.classList.remove('visible');
  }
}

customElements.define('enflujo-seccion-ficha', SeccionFicha);
