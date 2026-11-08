export const AccountStatus = Object.freeze({
  ACTIVE: 'ATIVA',
  SUSPENDED: 'SUSPENSA',
  CLOSURE_PENDING: 'ENCERRAMENTO_PENDENTE',
  DELETED: 'EXCLUIDA'
});

export function isActiveAccount(status) {
  return status === AccountStatus.ACTIVE;
}
