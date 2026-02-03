export type VoidOrPromise = void | Promise<void>;

export interface WithdrawalPageProps {
  email?: string;
  onBack?: () => void;

  onWithdraw?: (password: string) => VoidOrPromise;

  onGoogleVerify?: () => VoidOrPromise;

  isGoogleButtonDisabled?: boolean;

  isSubmitting?: boolean;
}

export interface WithdrawalUiState {
  password: string;
  isPasswordVisible: boolean;
  isModalOpen: boolean;
}
