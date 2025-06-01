import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ClinicForm from "./components/form";

const ClinicFormPage = () => {
  return (
    <Dialog open={true}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicione sua clínica</DialogTitle>
            <DialogDescription>
              Adicione sua clínica para que você possa começar a usar o sistema.
            </DialogDescription>
          </DialogHeader>
          <ClinicForm />
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default ClinicFormPage;
