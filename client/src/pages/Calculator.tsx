import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Delete, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import bgImage from "@assets/generated_images/dark_abstract_neon_gradient_background.png";

type Operator = "+" | "-" | "×" | "÷" | null;

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const { toast } = useToast();

  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: Operator) => {
    if (operator && !waitingForNewValue) {
      calculate();
    }
    setPrevValue(parseFloat(display));
    setOperator(op);
    setWaitingForNewValue(true);
  };

  const calculate = () => {
    if (prevValue === null || operator === null) return;

    const current = parseFloat(display);
    let result = 0;

    switch (operator) {
      case "+":
        result = prevValue + current;
        break;
      case "-":
        result = prevValue - current;
        break;
      case "×":
        result = prevValue * current;
        break;
      case "÷":
        if (current === 0) {
          toast({
            title: "Error",
            description: "Cannot divide by zero",
            variant: "destructive",
          });
          setOperator(null);
          setPrevValue(null);
          setDisplay("Error");
          setWaitingForNewValue(true);
          return;
        }
        result = prevValue / current;
        break;
    }

    // Format to avoid long decimals
    const formattedResult = parseFloat(result.toFixed(8)).toString();
    setDisplay(formattedResult);
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const handleDelete = () => {
    if (waitingForNewValue) return;
    if (display.length === 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handlePercentage = () => {
    const num = parseFloat(display);
    setDisplay((num / 100).toString());
  };

  const handleInvert = () => {
    const num = parseFloat(display);
    setDisplay((num * -1).toString());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard",
    });
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
      if (e.key === ".") handleDecimal();
      if (e.key === "Backspace") handleDelete();
      if (e.key === "Escape") handleClear();
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      }
      if (e.key === "+") handleOperator("+");
      if (e.key === "-") handleOperator("-");
      if (e.key === "*") handleOperator("×");
      if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, prevValue, operator, waitingForNewValue]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="glass w-full max-w-[360px] rounded-3xl p-6 relative z-10 flex flex-col gap-6"
      >
        {/* Display Area */}
        <div className="relative">
          <div className="flex justify-between items-center mb-2 text-white/50 text-sm h-6">
            <span>{prevValue !== null ? `${prevValue} ${operator || ''}` : ''}</span>
            <button 
              onClick={copyToClipboard}
              className="hover:text-primary transition-colors p-1"
              data-testid="button-copy"
            >
              <Copy size={14} />
            </button>
          </div>
          <div 
            className="text-right text-5xl font-light tracking-tight text-white break-all h-20 flex items-center justify-end"
            data-testid="display-main"
          >
             <AnimatePresence mode="wait">
              <motion.span
                key={display}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.5, y: -10 }}
                transition={{ duration: 0.1 }}
              >
                {display}
              </motion.span>
             </AnimatePresence>
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          <CalcButton onClick={handleClear} variant="secondary" className="text-destructive font-medium">AC</CalcButton>
          <CalcButton onClick={handleInvert} variant="secondary">+/-</CalcButton>
          <CalcButton onClick={handlePercentage} variant="secondary">%</CalcButton>
          <CalcButton onClick={() => handleOperator("÷")} variant="primary">÷</CalcButton>

          <CalcButton onClick={() => handleNumber("7")}>7</CalcButton>
          <CalcButton onClick={() => handleNumber("8")}>8</CalcButton>
          <CalcButton onClick={() => handleNumber("9")}>9</CalcButton>
          <CalcButton onClick={() => handleOperator("×")} variant="primary">×</CalcButton>

          <CalcButton onClick={() => handleNumber("4")}>4</CalcButton>
          <CalcButton onClick={() => handleNumber("5")}>5</CalcButton>
          <CalcButton onClick={() => handleNumber("6")}>6</CalcButton>
          <CalcButton onClick={() => handleOperator("-")} variant="primary">-</CalcButton>

          <CalcButton onClick={() => handleNumber("1")}>1</CalcButton>
          <CalcButton onClick={() => handleNumber("2")}>2</CalcButton>
          <CalcButton onClick={() => handleNumber("3")}>3</CalcButton>
          <CalcButton onClick={() => handleOperator("+")} variant="primary">+</CalcButton>

          <CalcButton onClick={() => handleNumber("0")} className="col-span-2 aspect-auto">0</CalcButton>
          <CalcButton onClick={handleDecimal}>.</CalcButton>
          <CalcButton onClick={calculate} variant="primary">=</CalcButton>
        </div>
      </motion.div>
    </div>
  );
}

function CalcButton({ 
  children, 
  onClick, 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  variant?: "default" | "primary" | "secondary"; 
  className?: string;
}) {
  const baseClasses = "rounded-2xl text-xl font-medium flex items-center justify-center select-none cursor-pointer active:scale-95 transition-all duration-100 aspect-square";
  
  const variants = {
    default: "glass-button text-white hover:bg-white/10",
    primary: "glass-button-primary shadow-lg shadow-primary/20",
    secondary: "glass-button-secondary text-primary-foreground",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      data-testid={`button-${children?.toString()}`}
    >
      {children}
    </motion.button>
  );
}
