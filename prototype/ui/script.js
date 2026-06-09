const state = {
  operators: [
    {id:'op-1',name:'Alice',skills:['press','weld']},
    {id:'op-2',name:'Bob',skills:['assemble']},
    {id:'op-3',name:'Carla',skills:['paint','inspect']}
  ],
  machines: [
    {id:'m-1',name:'Press 1'},
    {id:'m-2',name:'Line A'},
    {id:'m-3',name:'Paint Booth'}
  ],
  workOrders: [
    {id:'WO-1001',title:'Bracket A',qty:120,priority:'High',assigned:{machine:'m-1',operator:'op-1'}},
    {id:'WO-1002',title:'Frame B',qty:40,priority:'Medium',assigned:{machine:'m-2',operator:null}},
    {id:'WO-1003',title:'Panel C',qty:200,priority:'Low',assigned:{machine:'m-3',operator:'op-3'}}
  ],
  audit: [],
  filters: {
    text: '',
    priority: ''
  }
};

const ui = {};

function init(){
  cacheElements();
  bindEvents();
  render();
}

function cacheElements(){
  ui.board = document.getElementById('board');
  ui.operatorsList = document.getElementById('operatorsList');
  ui.auditLog = document.getElementById('auditLog');
  ui.filterText = document.getElementById('filterText');
  ui.filterPriority = document.getElementById('filterPriority');
  ui.modal = document.getElementById('modal');
  ui.modalTitle = document.getElementById('modalTitle');
  ui.modalBody = document.getElementById('modalBody');
  ui.modalSave = document.getElementById('modalSave');
  ui.modalCancel = document.getElementById('modalCancel');
  ui.modalClose = document.getElementById('modalClose');
  ui.kpiUtil = document.getElementById('kpi-util');
  ui.kpiLabor = document.getElementById('kpi-labor');
  ui.kpiThroughput = document.getElementById('kpi-throughput');
}

function bindEvents(){
  ui.filterText.addEventListener('input', e => {
    state.filters.text = e.target.value.toLowerCase();
    renderBoard();
  });

  ui.filterPriority.addEventListener('change', e => {
    state.filters.priority = e.target.value;
    renderBoard();
  });

  ui.modalCancel.addEventListener('click', closeModal);
  ui.modalClose.addEventListener('click', closeModal);

  ui.board.addEventListener('dragstart', onDragStart);
  ui.board.addEventListener('dragend', onDragEnd);
  ui.board.addEventListener('dragover', onDragOver);
  ui.board.addEventListener('drop', onDrop);
}

function render(){
  renderOperators();
  renderBoard();
  renderAudit();
  computeKPIs();
}

function renderOperators(){
  ui.operatorsList.innerHTML = '';
  state.operators.forEach(op => {
    const item = document.createElement('li');
    item.textContent = `${op.name} (${op.skills.join(', ')})`;
    ui.operatorsList.appendChild(item);
  });
}

function renderBoard(){
  ui.board.innerHTML = '';

  state.machines.forEach((machine, index) => {
    const lane = document.createElement('section');
    lane.className = 'lane';
    lane.dataset.machine = machine.id;
    lane.dataset.testid = `machine-lane-${machine.id}`;
    lane.style.animationDelay = `${index * 40}ms`;

    const header = document.createElement('div');
    header.className = 'lane-header';
    header.innerHTML = `<strong>${machine.name}</strong><small>${machine.id}</small>`;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'lane-cards';
    cardsContainer.dataset.machine = machine.id;
    cardsContainer.dataset.testid = `machine-cards-${machine.id}`;

    lane.appendChild(header);
    lane.appendChild(cardsContainer);
    ui.board.appendChild(lane);
  });

  const visibleWorkOrders = state.workOrders.filter(order => {
    if (state.filters.text) {
      const search = state.filters.text;
      if (!order.id.toLowerCase().includes(search) && !order.title.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (state.filters.priority && order.priority !== state.filters.priority) {
      return false;
    }
    return true;
  });

  visibleWorkOrders.forEach(order => {
    const card = createCard(order);
    const target = ui.board.querySelector(`.lane-cards[data-machine="${order.assigned.machine}"]`) || ui.board.querySelector('.lane-cards');
    target.appendChild(card);
  });
}

function createCard(order){
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.id = `card-${order.id}`;
  card.dataset.workOrder = order.id;
  card.dataset.testid = `workorder-card-${order.id}`;
  card.innerHTML = `
    <div class="wo-id">${order.id}</div>
    <div class="wo-title">${order.title}</div>
    <div class="wo-meta">Qty: ${order.qty} • ${order.priority}</div>
  `;
  card.addEventListener('dblclick', () => openModal(order.id));
  return card;
}

function onDragStart(event){
  const card = event.target.closest('.card');
  if (!card) return;
  event.dataTransfer.setData('text/plain', card.dataset.workOrder);
  card.classList.add('dragging');
}

function onDragEnd(event){
  const card = event.target.closest('.card');
  if (!card) return;
  card.classList.remove('dragging');
}

function onDragOver(event){
  if (!event.target.closest('.lane-cards')) return;
  event.preventDefault();
}

function onDrop(event){
  const dropZone = event.target.closest('.lane-cards');
  if (!dropZone) return;
  event.preventDefault();
  const workOrderId = event.dataTransfer.getData('text/plain');
  const machineId = dropZone.dataset.machine;
  if (!workOrderId || !machineId) return;

  moveWorkOrder(workOrderId, machineId);
}

function moveWorkOrder(workOrderId, machineId){
  const order = state.workOrders.find(item => item.id === workOrderId);
  if (!order || order.assigned.machine === machineId) return;
  const previousMachine = order.assigned.machine;
  order.assigned.machine = machineId;
  logAudit(`Moved ${workOrderId} from ${previousMachine} → ${machineId}`);
  renderBoard();
  renderAudit();
  computeKPIs();
}

function openModal(workOrderId){
  const order = state.workOrders.find(item => item.id === workOrderId);
  if (!order) return;
  ui.modalTitle.textContent = `${order.id} • ${order.title}`;
  ui.modalBody.innerHTML = '';

  const summary = document.createElement('p');
  summary.innerHTML = `<strong>Qty:</strong> ${order.qty}`;

  const operatorLabel = document.createElement('label');
  operatorLabel.textContent = 'Assign Operator:';
  const operatorSelect = document.createElement('select');
  operatorSelect.id = 'selOp';
  state.operators.forEach(op => {
    const option = document.createElement('option');
    option.value = op.id;
    option.textContent = op.name;
    if (order.assigned.operator === op.id) option.selected = true;
    operatorSelect.appendChild(option);
  });

  const priorityLabel = document.createElement('label');
  priorityLabel.textContent = 'Priority:';
  const prioritySelect = document.createElement('select');
  prioritySelect.id = 'selPri';
  ['High', 'Medium', 'Low'].forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    if (order.priority === value) option.selected = true;
    prioritySelect.appendChild(option);
  });

  operatorLabel.appendChild(operatorSelect);
  priorityLabel.appendChild(prioritySelect);
  ui.modalBody.appendChild(summary);
  ui.modalBody.appendChild(operatorLabel);
  ui.modalBody.appendChild(priorityLabel);

  ui.modal.classList.remove('hidden');
  ui.modal.setAttribute('aria-hidden', 'false');

  ui.modalSave.onclick = () => {
    updateWorkOrder(order.id, {
      assigned: {
        ...order.assigned,
        operator: operatorSelect.value
      },
      priority: prioritySelect.value
    });
    closeModal();
  };
}

function updateWorkOrder(workOrderId, updates){
  const order = state.workOrders.find(item => item.id === workOrderId);
  if (!order) return;
  Object.assign(order, updates);
  logAudit(`Updated ${workOrderId} assignment/operator`);
  renderBoard();
  renderAudit();
  computeKPIs();
}

function closeModal(){
  ui.modal.classList.add('hidden');
  ui.modal.setAttribute('aria-hidden', 'true');
}

function renderAudit(){
  ui.auditLog.innerHTML = '';
  state.audit.slice(0, 50).forEach(entry => {
    const item = document.createElement('li');
    item.textContent = entry;
    ui.auditLog.appendChild(item);
  });
}

function logAudit(message){
  state.audit.unshift(`${new Date().toLocaleTimeString()} - ${message}`);
}

function computeKPIs(){
  const totalMachines = state.machines.length;
  const assignedMachines = state.workOrders.filter(w => !!w.assigned.machine).length;
  const utilization = totalMachines ? Math.round((assignedMachines / totalMachines) * 100) : 0;
  ui.kpiUtil.textContent = `${utilization}%`;

  const laborAssigned = state.workOrders.filter(w => !!w.assigned.operator).length;
  const laborUtil = state.operators.length ? Math.round((laborAssigned / state.operators.length) * 100) : 0;
  ui.kpiLabor.textContent = `${laborUtil}%`;

  ui.kpiThroughput.textContent = state.workOrders.reduce((sum, order) => sum + order.qty, 0);
}

window.addEventListener('DOMContentLoaded', init);
