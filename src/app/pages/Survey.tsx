import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, Star, ChevronRight, Sparkles, Loader2, ChevronDown, Calendar } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { supabase } from "../../lib/supabase";

export function Survey() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchSurvey() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setSurvey(data);
        setQuestions(data.questions || []);
      }
      setIsLoading(false);
    }
    fetchSurvey();
  }, [id]);

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const question = questions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      // Swipe Left -> Next
      if (isAnswered()) handleNext();
    } else if (info.offset.x > threshold) {
      // Swipe Right -> Previous
      if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Parse reward points from survey
    const pointsMatch = survey.reward?.match(/\d+/);
    const points = pointsMatch ? parseInt(pointsMatch[0]) : 0;

    const responsePayload = {
      survey_id: id,
      user_id: user?.id,
      answers: answers,
      submitted_at: new Date().toISOString(),
      points_awarded: points
    };

    console.log("Submitting survey response:", responsePayload);

    const { data: responseData, error: responseError } = await supabase
      .from("responses")
      .insert([responsePayload])
      .select();

    if (responseError) {
      console.error("Supabase insert error:", responseError);
      alert(`Error submitting survey: ${responseError.message}`);
    } else {
      console.log("Response saved successfully:", responseData);
      
      // 2. Increment survey response count
      await supabase
        .from("surveys")
        .update({ responses: (survey.responses || 0) + 1 })
        .eq("id", id);
      
      // 3. ALWAYS update the user's profile (points + completed_count)
      if (user) {
        // Fetch current profile values first
        const { data: currentProfile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("points, completed_count")
          .eq("id", user.id)
          .single();

        if (profileFetchError) {
          console.error("Error fetching profile:", profileFetchError);
        }

        const currentPoints = currentProfile?.points || 0;
        const currentCount = currentProfile?.completed_count || 0;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            points: currentPoints + points,
            completed_count: currentCount + 1
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating profile points:", updateError);
        } else {
          console.log(`Profile updated: +${points} points, completed_count: ${currentCount + 1}`);
        }
      }

      setIsSuccess(true);
    }
    setIsSubmitting(false);
  };

  const handleAnswer = (answer: any) => {
    setAnswers({ ...answers, [question.id]: answer });
  };

  const toggleCheckbox = (option: string) => {
    const current = answers[question.id] || [];
    const updated = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleAnswer(updated);
  };

  const isAnswered = () => {
    if (!question) return false;
    const answer = answers[question.id];
    if (answer === undefined || answer === null) return false;
    if (question.type === "checkbox") return Array.isArray(answer) && answer.length > 0;
    if (question.type === "ranking") return Array.isArray(answer) && answer.length > 0;
    if (question.type === "text" || question.type === "short_text") return typeof answer === 'string' && answer.trim().length > 0;
    if (question.type === "date") return typeof answer === 'string' && answer.length > 0;
    if (question.type === "rating") return typeof answer === 'number' && answer > 0;
    if (question.type === "linear_scale") return typeof answer === 'number';
    if (question.type === "yes_no") return answer === "Yes" || answer === "No";
    if (question.type === "dropdown") return typeof answer === 'string' && answer.length > 0;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-emerald-600" />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-slate-800 mb-2"
        >
          Success!
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 mb-8 max-w-[280px]"
        >
          Thanks for your feedback! Your contribution helps us improve.
        </motion.p>
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/app/activity")}
          className="w-full max-w-xs py-4 bg-primary text-white rounded-3xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          View Activity
        </motion.button>
      </div>
    );
  }

  if (!survey || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Survey Not Found</h2>
        <p className="text-muted-foreground mb-6">This survey might have been removed or is no longer active.</p>
        <button onClick={() => navigate("/app")} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 w-full">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 lg:px-10 py-4 sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/app")}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium truncate max-w-[150px]">
              {survey.title}
            </p>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
          </div>
          {/* Question dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentQuestion
                    ? "bg-primary w-5"
                    : i < currentQuestion
                    ? "bg-primary/40"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress.Root className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <Progress.Indicator
            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </Progress.Root>
      </div>

      {/* Question Content */}
      <div className="flex-1 px-6 py-8 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            dragElastic={0.2}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 touch-none"
          >
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 px-1">
                {question.type === "radio"
                  ? "Single Choice"
                  : question.type === "checkbox"
                  ? "Multiple Choice"
                  : question.type === "rating"
                  ? "Rating"
                  : question.type === "dropdown"
                  ? "Dropdown"
                  : question.type === "yes_no"
                  ? "Yes or No"
                  : question.type === "linear_scale"
                  ? "Scale"
                  : question.type === "short_text"
                  ? "Short Answer"
                  : question.type === "date"
                  ? "Date"
                  : question.type === "ranking"
                  ? "Rank in Order"
                  : "Open Ended"}
              </p>
              <h2 className="text-2xl font-bold text-slate-800 leading-snug">
                {question.question}
              </h2>
            </div>

            {/* Radio Options */}
            {question.type === "radio" && (
              <div className="space-y-3">
                {question.options?.map((option: string, i: number) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-5 rounded-3xl border-2 text-left transition-all active:scale-[0.98] ${
                      answers[question.id] === option
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-sm ${answers[question.id] === option ? 'text-primary' : 'text-slate-600'}`}>{option}</span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          answers[question.id] === option
                            ? "bg-primary border-primary"
                            : "border-slate-200"
                        }`}
                      >
                        {answers[question.id] === option && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Checkbox Options */}
            {question.type === "checkbox" && (
              <div className="space-y-3">
                {question.options?.map((option: string, i: number) => {
                  const isSelected = (answers[question.id] || []).includes(
                    option
                  );
                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => toggleCheckbox(option)}
                      className={`w-full p-5 rounded-3xl border-2 text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-slate-600'}`}>{option}</span>
                        <div
                          className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Rating Stars */}
            {question.type === "rating" && (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => handleAnswer(star)}
                      className="transition-transform hover:scale-125 active:scale-95"
                      whileTap={{ scale: 0.8 }}
                    >
                      <Star
                        className={`w-14 h-14 transition-colors ${
                          star <= (answers[question.id] || 0)
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                            : "text-slate-200"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <motion.p
                  className="mt-6 text-sm font-bold text-slate-400"
                  animate={{
                    opacity: answers[question.id] ? 1 : 0.5,
                  }}
                >
                  {answers[question.id] === 1
                    ? "😞 Not Satisfied"
                    : answers[question.id] === 2
                    ? "😐 Slightly Satisfied"
                    : answers[question.id] === 3
                    ? "🤔 Neutral"
                    : answers[question.id] === 4
                    ? "😊 Satisfied"
                    : answers[question.id] === 5
                    ? "🤩 Extremely Satisfied!"
                    : "Tap to rate"}
                </motion.p>
              </div>
            )}

            {/* Text Input (Long) */}
            {question.type === "text" && (
              <div className="relative">
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Share your detailed feedback here..."
                  rows={8}
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all resize-none text-base text-slate-800"
                />
                <div className="absolute bottom-4 right-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {(answers[question.id] || "").length} characters
                </div>
              </div>
            )}

            {/* Dropdown */}
            {question.type === "dropdown" && (
              <div className="relative">
                <select
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full p-5 rounded-3xl border-2 border-slate-100 bg-white text-sm font-semibold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all appearance-none cursor-pointer pr-12"
                >
                  <option value="" disabled>Select an option...</option>
                  {question.options?.map((option: string, i: number) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            )}

            {/* Yes / No */}
            {question.type === "yes_no" && (
              <div className="grid grid-cols-2 gap-4">
                {["Yes", "No"].map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`p-8 rounded-3xl border-2 text-center transition-all ${
                      answers[question.id] === option
                        ? option === "Yes"
                          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                          : "border-red-400 bg-red-50 shadow-lg shadow-red-400/10"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="text-4xl mb-2">{option === "Yes" ? "✅" : "❌"}</div>
                    <span className={`text-lg font-bold ${
                      answers[question.id] === option
                        ? option === "Yes" ? "text-emerald-700" : "text-red-600"
                        : "text-slate-600"
                    }`}>{option}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Linear Scale */}
            {question.type === "linear_scale" && (
              <div className="py-6">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3 px-1">
                  <span>{question.minLabel || "Min"}</span>
                  <span>{question.maxLabel || "Max"}</span>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {Array.from(
                    { length: (question.scaleMax || 10) - (question.scaleMin || 1) + 1 },
                    (_, i) => (question.scaleMin || 1) + i
                  ).map((num) => (
                    <motion.button
                      key={num}
                      onClick={() => handleAnswer(num)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-12 h-12 rounded-2xl border-2 font-bold text-sm transition-all ${
                        answers[question.id] === num
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                          : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                      }`}
                    >
                      {num}
                    </motion.button>
                  ))}
                </div>
                {answers[question.id] !== undefined && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-4 text-sm font-semibold text-primary"
                  >
                    You selected: {answers[question.id]}
                  </motion.p>
                )}
              </div>
            )}

            {/* Short Answer */}
            {question.type === "short_text" && (
              <div>
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-base text-slate-800"
                />
              </div>
            )}

            {/* Date Picker */}
            {question.type === "date" && (
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-base text-slate-800 cursor-pointer"
                />
              </div>
            )}

            {/* Ranking */}
            {question.type === "ranking" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 mb-3">Tap items to set their rank order (1st, 2nd, 3rd...)</p>
                {(() => {
                  const ranked: string[] = answers[question.id] || [];
                  const unranked = (question.options || []).filter((o: string) => !ranked.includes(o));
                  
                  return (
                    <>
                      {/* Already ranked items */}
                      {ranked.map((item: string, idx: number) => (
                        <motion.button
                          key={`ranked-${item}`}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => {
                            // Remove from ranked
                            handleAnswer(ranked.filter((r: string) => r !== item));
                          }}
                          className="w-full p-4 rounded-2xl border-2 border-primary bg-primary/5 text-left transition-all flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span className="font-semibold text-sm text-primary flex-1">{item}</span>
                          <span className="text-[10px] text-primary/60 font-bold">TAP TO REMOVE</span>
                        </motion.button>
                      ))}
                      
                      {/* Unranked items */}
                      {unranked.map((item: string) => (
                        <motion.button
                          key={`unranked-${item}`}
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            handleAnswer([...ranked, item]);
                          }}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 text-left transition-all flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                            -
                          </div>
                          <span className="font-semibold text-sm text-slate-600">{item}</span>
                        </motion.button>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Button */}
      <div className="px-6 pb-8 pt-6 bg-white border-t border-slate-100 flex justify-center fixed bottom-0 w-full left-0 z-20">
        <div className="max-w-4xl w-full px-0 lg:px-10">
          {currentQuestion < questions.length - 1 ? (
            <motion.button
              onClick={handleNext}
              disabled={!isAnswered()}
              className="w-full py-4.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-[24px] font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 transition-all active:scale-[0.97] disabled:opacity-30 disabled:grayscale disabled:shadow-none flex items-center justify-center gap-2"
              whileHover={isAnswered() ? { y: -2 } : {}}
              whileTap={isAnswered() ? { scale: 0.98 } : {}}
            >
              <span className="text-lg">Next Question</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={!isAnswered() || isSubmitting}
              className="w-full py-4.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[24px] font-bold shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 transition-all active:scale-[0.97] disabled:opacity-30 disabled:grayscale disabled:shadow-none flex items-center justify-center gap-2"
              whileHover={isAnswered() ? { y: -2 } : {}}
              whileTap={isAnswered() ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span className="text-lg">Complete Survey</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}