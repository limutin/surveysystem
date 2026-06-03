import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle2,
  X,
  PlusCircle,
  BarChart3,
  Users,
  Star,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  Upload,
  ImagePlus
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export function AdminSurveys() {
  const [surveysList, setSurveysList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<any>(null); // null = create mode
  const [viewingSurvey, setViewingSurvey] = useState<any>(null);
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New Survey Form State
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    category: "General",
    reward: "50 pts",
    status: "Active",
    time: "5 mins",
    duration: "",
    image_url: "",
    emoji: "📝",
    questions: [
      { id: 1, type: "radio", question: "Example Question?", options: ["Option 1", "Option 2"] }
    ]
  });

  const fetchSurveys = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setSurveysList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleViewResults = async (survey: any) => {
    setViewingSurvey(survey);
    setLoadingResponses(true);
    
    const { data, error } = await supabase
      .from("responses")
      .select(`
        *,
        profile:profiles (full_name, email)
      `)
      .eq("survey_id", survey.id)
      .order("submitted_at", { ascending: false });

    if (data) setSurveyResponses(data);
    setLoadingResponses(false);
  };

  // Generate insights from responses
  const generateInsights = (survey: any, responses: any[]) => {
    if (!survey?.questions || responses.length === 0) return [];
    
    const insights: any[] = [];
    
    survey.questions.forEach((q: any) => {
      const questionInsight: any = { question: q.question, type: q.type, data: [] };
      
      if (q.type === "radio") {
        const counts: Record<string, number> = {};
        responses.forEach(r => {
          const answer = r.answers?.[q.id];
          if (answer) counts[answer] = (counts[answer] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        questionInsight.data = Object.entries(counts)
          .map(([label, count]) => ({ label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
          .sort((a, b) => b.count - a.count);
        questionInsight.topAnswer = questionInsight.data[0]?.label || "N/A";
      }
      
      if (q.type === "checkbox") {
        const counts: Record<string, number> = {};
        responses.forEach(r => {
          const answers = r.answers?.[q.id];
          if (Array.isArray(answers)) {
            answers.forEach((a: string) => { counts[a] = (counts[a] || 0) + 1; });
          }
        });
        const total = responses.length;
        questionInsight.data = Object.entries(counts)
          .map(([label, count]) => ({ label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
          .sort((a, b) => b.count - a.count);
        questionInsight.topAnswer = questionInsight.data[0]?.label || "N/A";
      }
      
      if (q.type === "rating") {
        const ratings = responses.map(r => r.answers?.[q.id]).filter((r): r is number => typeof r === "number");
        const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
        const distribution = [1, 2, 3, 4, 5].map(star => ({
          label: `${star} ★`,
          count: ratings.filter(r => r === star).length,
          percent: ratings.length > 0 ? Math.round((ratings.filter(r => r === star).length / ratings.length) * 100) : 0
        }));
        questionInsight.data = distribution;
        questionInsight.average = avg.toFixed(1);
      }
      
      if (q.type === "text") {
        const texts = responses.map(r => r.answers?.[q.id]).filter((t): t is string => typeof t === "string" && t.trim().length > 0);
        questionInsight.data = texts.slice(0, 5);
        questionInsight.totalTexts = texts.length;
      }
      
      if (q.type === "dropdown") {
        const counts: Record<string, number> = {};
        responses.forEach(r => {
          const answer = r.answers?.[q.id];
          if (answer) counts[answer] = (counts[answer] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        questionInsight.data = Object.entries(counts)
          .map(([label, count]) => ({ label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
          .sort((a, b) => b.count - a.count);
        questionInsight.topAnswer = questionInsight.data[0]?.label || "N/A";
      }

      if (q.type === "yes_no") {
        const counts: Record<string, number> = { "Yes": 0, "No": 0 };
        responses.forEach(r => {
          const answer = r.answers?.[q.id];
          if (answer === "Yes" || answer === "No") counts[answer]++;
        });
        const total = counts["Yes"] + counts["No"];
        questionInsight.data = Object.entries(counts)
          .map(([label, count]) => ({ label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }));
        questionInsight.topAnswer = counts["Yes"] >= counts["No"] ? "Yes" : "No";
      }

      if (q.type === "linear_scale") {
        const values = responses.map(r => r.answers?.[q.id]).filter((v): v is number => typeof v === "number");
        const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
        const min = q.scaleMin || 1;
        const max = q.scaleMax || 10;
        const distribution = [];
        for (let i = min; i <= max; i++) {
          distribution.push({
            label: i.toString(),
            count: values.filter(v => v === i).length,
            percent: values.length > 0 ? Math.round((values.filter(v => v === i).length / values.length) * 100) : 0
          });
        }
        questionInsight.data = distribution;
        questionInsight.average = avg.toFixed(1);
      }

      if (q.type === "short_text") {
        const texts = responses.map(r => r.answers?.[q.id]).filter((t): t is string => typeof t === "string" && t.trim().length > 0);
        questionInsight.data = texts.slice(0, 5);
        questionInsight.totalTexts = texts.length;
      }

      if (q.type === "date") {
        const dates = responses.map(r => r.answers?.[q.id]).filter((d): d is string => typeof d === "string" && d.length > 0);
        questionInsight.data = dates.slice(0, 10);
        questionInsight.totalTexts = dates.length;
      }

      if (q.type === "ranking") {
        // Show average rank for each option
        const rankCounts: Record<string, number[]> = {};
        responses.forEach(r => {
          const answer = r.answers?.[q.id];
          if (Array.isArray(answer)) {
            answer.forEach((item: string, idx: number) => {
              if (!rankCounts[item]) rankCounts[item] = [];
              rankCounts[item].push(idx + 1);
            });
          }
        });
        questionInsight.data = Object.entries(rankCounts)
          .map(([label, ranks]) => ({
            label,
            count: ranks.length,
            percent: Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 10) / 10
          }))
          .sort((a, b) => a.percent - b.percent);
      }

      insights.push(questionInsight);
    });
    
    return insights;
  };

  const handleAddQuestion = () => {
    const newId = newSurvey.questions.length > 0 ? Math.max(...newSurvey.questions.map(q => q.id)) + 1 : 1;
    setNewSurvey({
      ...newSurvey,
      questions: [
        ...newSurvey.questions,
        { id: newId, type: "radio", question: "", options: [""], scaleMin: 1, scaleMax: 10, minLabel: "Not likely", maxLabel: "Very likely" }
      ]
    });
  };

  const handleRemoveQuestion = (id: number) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.filter(q => q.id !== id)
    });
  };

  const handleQuestionChange = (id: number, field: string, value: any) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const handleAddOption = (questionId: number) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map(q => 
        q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q
      )
    });
  };

  const handleOptionChange = (questionId: number, optionIndex: number, value: string) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.map(q => 
        q.id === questionId ? { 
          ...q, 
          options: q.options?.map((opt: string, i: number) => i === optionIndex ? value : opt) 
        } : q
      )
    });
  };

  // Handle local image file selection
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.title) return alert("Please enter a title");
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageIfNeeded();
      const finalImageUrl = uploadedUrl ?? newSurvey.image_url;

      const { error } = await supabase
        .from("surveys")
        .insert([{
          ...newSurvey,
          image_url: finalImageUrl,
          responses: 0,
          color: "from-indigo-500 to-purple-400",
          shadowColor: "shadow-indigo-500/20",
          tag: "New",
          tagColor: "bg-emerald-100 text-emerald-700"
        }]);

      if (error) throw new Error(error.message);
      fetchSurveys();
      resetModal();
    } catch (err: any) {
      alert(`Error creating survey: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Reset / close modal helper ──
  const resetModal = () => {
    setIsModalOpen(false);
    setEditingSurvey(null);
    setImageFile(null);
    setImagePreview("");
    setNewSurvey({
      title: "",
      description: "",
      category: "General",
      reward: "50 pts",
      status: "Active",
      time: "5 mins",
      duration: "",
      image_url: "",
      emoji: "📝",
      questions: [{ id: 1, type: "radio", question: "", options: [""], scaleMin: 1, scaleMax: 10, minLabel: "Not likely", maxLabel: "Very likely" }]
    });
  };

  // ── Open Edit modal pre-filled with existing data ──
  const handleOpenEdit = (survey: any) => {
    setEditingSurvey(survey);
    setNewSurvey({
      title: survey.title || "",
      description: survey.description || "",
      category: survey.category || "General",
      reward: survey.reward || "50 pts",
      status: survey.status || "Active",
      time: survey.time || "5 mins",
      duration: survey.duration || "",
      image_url: survey.image_url || "",
      emoji: survey.emoji || "📝",
      questions: survey.questions?.length
        ? survey.questions
        : [{ id: 1, type: "radio", question: "", options: [""], scaleMin: 1, scaleMax: 10, minLabel: "Not likely", maxLabel: "Very likely" }]
    });
    // Show existing image as preview
    setImagePreview(survey.image_url || "");
    setImageFile(null);
    setIsModalOpen(true);
  };

  // ── Upload image helper (shared by create & update) ──
  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!imageFile) return null; // no new file chosen
    const ext = imageFile.name.split(".").pop();
    const fileName = `survey_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("survey-images")
      .upload(fileName, imageFile, { upsert: true, contentType: imageFile.type });
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage
      .from("survey-images")
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleUpdateSurvey = async () => {
    if (!newSurvey.title) return alert("Please enter a title");
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageIfNeeded();
      const finalImageUrl = uploadedUrl ?? newSurvey.image_url;

      const { error } = await supabase
        .from("surveys")
        .update({ ...newSurvey, image_url: finalImageUrl })
        .eq("id", editingSurvey.id);

      if (error) throw new Error(error.message);
      fetchSurveys();
      resetModal();
    } catch (err: any) {
      alert(`Error updating survey: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      await supabase.from("surveys").delete().eq("id", id);
      fetchSurveys();
    }
  };

  const insights = viewingSurvey ? generateInsights(viewingSurvey, surveyResponses) : [];

  // ─── VIEW RESULTS PANEL ───
  if (viewingSurvey) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen pb-20">
        {/* Back Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setViewingSurvey(null); setSurveyResponses([]); }}
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{viewingSurvey.title}</h1>
            <p className="text-slate-500 mt-0.5">Survey results & response insights</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Responses", value: surveyResponses.length.toString(), icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Questions", value: (viewingSurvey.questions?.length || 0).toString(), icon: MessageSquare, color: "bg-indigo-50 text-indigo-600" },
            { label: "Reward", value: viewingSurvey.reward || "0 pts", icon: Star, color: "bg-amber-50 text-amber-600" },
            { label: "Status", value: viewingSurvey.status || "Active", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm"
              >
                <div className={`p-2.5 rounded-xl w-fit ${stat.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {loadingResponses ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : surveyResponses.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Responses Yet</h3>
            <p className="text-slate-400 text-sm">Wait for users to complete this survey to see insights.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question Insights */}
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg">
                      Q{i + 1} · {insight.type === "radio" ? "Single Choice" : insight.type === "checkbox" ? "Multi Choice" : insight.type === "rating" ? "Rating" : insight.type === "dropdown" ? "Dropdown" : insight.type === "yes_no" ? "Yes / No" : insight.type === "linear_scale" ? "Linear Scale" : insight.type === "short_text" ? "Short Answer" : insight.type === "date" ? "Date" : insight.type === "ranking" ? "Ranking" : "Open Ended"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-3">{insight.question}</h3>
                </div>

                <div className="p-6">
                  {/* Radio / Checkbox / Dropdown / Yes-No bar chart */}
                  {(insight.type === "radio" || insight.type === "checkbox" || insight.type === "dropdown" || insight.type === "yes_no") && (
                    <div className="space-y-3">
                      {insight.data.map((item: any, j: number) => (
                        <div key={j}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                            <span className="text-xs font-bold text-slate-500">{item.count} ({item.percent}%)</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percent}%` }}
                              transition={{ duration: 0.8, delay: j * 0.1 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                      {insight.topAnswer && (
                        <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                          🏆 Most popular: <strong className="text-slate-600">{insight.topAnswer}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rating display */}
                  {insight.type === "rating" && (
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-5xl font-black text-slate-900">{insight.average}</div>
                        <div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-5 h-5 ${s <= Math.round(parseFloat(insight.average)) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Average rating from {surveyResponses.length} responses</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {insight.data.map((item: any, j: number) => (
                          <div key={j} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 w-8">{item.label}</span>
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percent}%` }}
                                transition={{ duration: 0.6, delay: j * 0.08 }}
                                className="h-full bg-amber-400 rounded-full"
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linear Scale display */}
                  {insight.type === "linear_scale" && (
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-5xl font-black text-slate-900">{insight.average}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Average Score</p>
                          <p className="text-xs text-slate-400 mt-1">From {surveyResponses.length} responses</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {insight.data.map((item: any, j: number) => (
                          <div key={j} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 w-6 text-right">{item.label}</span>
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percent}%` }}
                                transition={{ duration: 0.6, delay: j * 0.05 }}
                                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ranking display */}
                  {insight.type === "ranking" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-2">Average Rank Position</p>
                      {insight.data.map((item: any, j: number) => (
                        <div key={j} className="flex items-center gap-3">
                          <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">{j + 1}</span>
                          <span className="text-sm font-semibold text-slate-700 flex-1">{item.label}</span>
                          <span className="text-xs text-slate-400">Avg rank: {item.percent}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short Text / Date responses */}
                  {(insight.type === "short_text" || insight.type === "date") && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-2">{insight.totalTexts} Responses</p>
                      {insight.data.map((text: string, j: number) => (
                        <div key={j} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-sm text-slate-700 leading-relaxed">"{text}"</p>
                        </div>
                      ))}
                      {insight.totalTexts > (insight.type === "date" ? 10 : 5) && (
                        <p className="text-xs text-slate-400 text-center">...and {insight.totalTexts - (insight.type === "date" ? 10 : 5)} more responses</p>
                      )}
                    </div>
                  )}

                  {/* Text responses */}
                  {insight.type === "text" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-2">{insight.totalTexts} Written Responses</p>
                      {insight.data.map((text: string, j: number) => (
                        <div key={j} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-sm text-slate-700 leading-relaxed">"{text}"</p>
                        </div>
                      ))}
                      {insight.totalTexts > 5 && (
                        <p className="text-xs text-slate-400 text-center">...and {insight.totalTexts - 5} more responses</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Individual Responses Table */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Individual Responses</h3>
                <p className="text-sm text-slate-400">All {surveyResponses.length} submissions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Respondent</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {surveyResponses.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                              <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${r.profile?.full_name || 'User'}`} alt="" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{r.profile?.full_name || "Anonymous"}</p>
                              <p className="text-[11px] text-slate-400">{r.profile?.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-amber-600">+{r.points_awarded || 0} pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Survey Management</h1>
          <p className="text-slate-500 mt-1">Create, edit and monitor your active surveys.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create New Survey
        </button>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title, category..." 
            className="bg-transparent border-none outline-none text-sm text-slate-600 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option>All Status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Paused</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveysList.map((survey, i) => (
          <motion.div
            key={survey.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
          >
            {/* Cover Image */}
            <div className="relative w-full h-36 overflow-hidden rounded-t-[32px]">
              {survey.image_url ? (
                <img
                  src={survey.image_url}
                  alt={survey.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center`}>
                  <span className="text-4xl">{survey.emoji || "📝"}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {/* Duration badge */}
              {(survey.duration || survey.time) && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3" />
                  <span>{survey.duration || survey.time}</span>
                </div>
              )}
              <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                survey.status === 'Active' ? 'bg-emerald-500/90 text-white' :
                survey.status === 'Draft' ? 'bg-blue-500/90 text-white' : 'bg-amber-500/90 text-white'
              }`}>
                {survey.status}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                {survey.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                {survey.description || `Manage questions and view responses for this ${(survey.category || 'general').toLowerCase()} survey.`}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Responses</p>
                  <p className="font-bold text-slate-800">{(survey.responses || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Reward</p>
                  <p className="font-bold text-slate-800">{survey.reward}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-2 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Created {survey.created_at ? new Date(survey.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) : "Recently"}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {survey.category}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleViewResults(survey)}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Results
                </button>
                <button 
                  onClick={() => handleOpenEdit(survey)}
                  className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteSurvey(survey.id)}
                  className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            

          </motion.div>
        ))}
      </div>

      {/* Create Survey Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => resetModal()}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingSurvey ? "Edit Survey" : "Create New Survey"}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {editingSurvey ? "Update the survey details and questions." : "Design your survey and questions."}
                  </p>
                </div>
                <button 
                  onClick={() => resetModal()}
                  className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* General Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    <h3 className="font-bold text-slate-800">General Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Survey Title</label>
                      <input 
                        type="text" 
                        value={newSurvey.title}
                        onChange={(e) => setNewSurvey({...newSurvey, title: e.target.value})}
                        placeholder="e.g. Platform User Experience"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                      <select 
                        value={newSurvey.category}
                        onChange={(e) => setNewSurvey({...newSurvey, category: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                      >
                        <option>General</option>
                        <option>Technology</option>
                        <option>Lifestyle</option>
                        <option>Shopping</option>
                        <option>Health</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                    <textarea 
                      value={newSurvey.description}
                      onChange={(e) => setNewSurvey({...newSurvey, description: e.target.value})}
                      placeholder="What is this survey about?"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Reward</label>
                      <input 
                        type="text" 
                        value={newSurvey.reward}
                        onChange={(e) => setNewSurvey({...newSurvey, reward: e.target.value})}
                        placeholder="50 pts"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Duration (e.g. 5 mins)</label>
                      <input 
                        type="text" 
                        value={newSurvey.duration}
                        onChange={(e) => setNewSurvey({...newSurvey, duration: e.target.value})}
                        placeholder="5 mins"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Icon Emoji</label>
                      <input 
                        type="text" 
                        value={newSurvey.emoji}
                        onChange={(e) => setNewSurvey({...newSurvey, emoji: e.target.value})}
                        placeholder="📝"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cover Image</label>

                    {/* Hidden native file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                    />

                    {/* Dropzone / Preview */}
                    {imagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden h-36 border-2 border-indigo-300 shadow-sm">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" /> Change
                          </button>
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(""); }}
                            className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        {/* File name badge */}
                        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {imageFile?.name}
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleImageSelect(file);
                        }}
                        className="w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 group-hover:border-indigo-300 transition-colors">
                          <ImagePlus className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Click or drag & drop an image</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                      <h3 className="font-bold text-slate-800">Survey Questions ({newSurvey.questions.length})</h3>
                    </div>
                    <button 
                      onClick={handleAddQuestion}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {newSurvey.questions.map((q, index) => (
                      <motion.div 
                        key={q.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-slate-50 rounded-[32px] border border-slate-100 relative group"
                      >
                        <div className="absolute -top-3 -left-3 bg-white border border-slate-200 text-slate-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                          {index + 1}
                        </div>
                        <button 
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="absolute -top-3 -right-3 bg-red-50 text-red-500 border border-red-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Question Text</label>
                              <input 
                                type="text"
                                value={q.question}
                                onChange={(e) => handleQuestionChange(q.id, "question", e.target.value)}
                                placeholder="Enter your question here..."
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Type</label>
                              <select 
                                value={q.type}
                                onChange={(e) => handleQuestionChange(q.id, "type", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                              >
                              <option value="radio">Single Choice</option>
                                <option value="checkbox">Multiple Choice</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="yes_no">Yes / No</option>
                                <option value="rating">Rating (1-5 Stars)</option>
                                <option value="linear_scale">Linear Scale</option>
                                <option value="text">Long Text</option>
                                <option value="short_text">Short Answer</option>
                                <option value="date">Date Picker</option>
                                <option value="ranking">Ranking / Order</option>
                              </select>
                            </div>
                          </div>

                          {(q.type === "radio" || q.type === "checkbox" || q.type === "dropdown" || q.type === "ranking") && (
                            <div className="space-y-2 pt-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">
                                {q.type === "ranking" ? "Items to Rank (order matters)" : "Options"}
                              </label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.options?.map((opt: string, optIndex: number) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 flex-shrink-0 flex items-center justify-center text-[9px] font-bold rounded ${
                                      q.type === "ranking" ? "bg-amber-100 text-amber-600 rounded-md" :
                                      q.type === "dropdown" ? "bg-blue-100 text-blue-600 rounded-md" :
                                      "text-slate-300"
                                    }`}>
                                      {q.type === "ranking" ? optIndex + 1 : q.type === "dropdown" ? "▾" : "●"}
                                    </div>
                                    <input 
                                      type="text"
                                      value={opt}
                                      onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                                      placeholder={q.type === "ranking" ? `Item ${optIndex + 1}` : `Option ${optIndex + 1}`}
                                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                    />
                                    <button
                                      onClick={() => {
                                        if ((q.options?.length || 0) > 1) {
                                          setNewSurvey({
                                            ...newSurvey,
                                            questions: newSurvey.questions.map(qq =>
                                              qq.id === q.id ? { ...qq, options: qq.options?.filter((_: any, i: number) => i !== optIndex) } : qq
                                            )
                                          });
                                        }
                                      }}
                                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove option"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                    {optIndex === q.options!.length - 1 && (
                                      <button 
                                        onClick={() => handleAddOption(q.id)}
                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Yes/No preview */}
                          {q.type === "yes_no" && (
                            <div className="pt-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Preview</label>
                              <div className="flex gap-3">
                                <div className="flex-1 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-sm font-bold text-emerald-700">✅ Yes</div>
                                <div className="flex-1 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-center text-sm font-bold text-red-600">❌ No</div>
                              </div>
                            </div>
                          )}

                          {/* Rating preview */}
                          {q.type === "rating" && (
                            <div className="pt-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Preview</label>
                              <div className="flex gap-2 items-center">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className="w-7 h-7 text-amber-300 fill-amber-300" />
                                ))}
                                <span className="text-xs text-slate-400 ml-2">1-5 Stars</span>
                              </div>
                            </div>
                          )}

                          {/* Linear Scale config */}
                          {q.type === "linear_scale" && (
                            <div className="pt-3 space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Scale Configuration</label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Min Value</label>
                                  <input
                                    type="number"
                                    value={q.scaleMin || 1}
                                    onChange={(e) => handleQuestionChange(q.id, "scaleMin", parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Max Value</label>
                                  <input
                                    type="number"
                                    value={q.scaleMax || 10}
                                    onChange={(e) => handleQuestionChange(q.id, "scaleMax", parseInt(e.target.value) || 10)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Min Label</label>
                                  <input
                                    type="text"
                                    value={q.minLabel || ""}
                                    onChange={(e) => handleQuestionChange(q.id, "minLabel", e.target.value)}
                                    placeholder="Not likely"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Max Label</label>
                                  <input
                                    type="text"
                                    value={q.maxLabel || ""}
                                    onChange={(e) => handleQuestionChange(q.id, "maxLabel", e.target.value)}
                                    placeholder="Very likely"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                  />
                                </div>
                              </div>
                              {/* Scale preview */}
                              <div className="bg-white border border-slate-100 rounded-2xl p-3">
                                <div className="flex items-center justify-between text-[9px] text-slate-400 mb-2">
                                  <span>{q.minLabel || "Min"}</span>
                                  <span>{q.maxLabel || "Max"}</span>
                                </div>
                                <div className="flex gap-1">
                                  {Array.from({ length: (q.scaleMax || 10) - (q.scaleMin || 1) + 1 }, (_, i) => (q.scaleMin || 1) + i).map(n => (
                                    <div key={n} className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-[10px] font-bold text-slate-400">
                                      {n}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Text / Short Text preview */}
                          {(q.type === "text" || q.type === "short_text") && (
                            <div className="pt-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Preview</label>
                              {q.type === "text" ? (
                                <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-300 h-20">Long text response area...</div>
                              ) : (
                                <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-300">Short answer input...</div>
                              )}
                            </div>
                          )}

                          {/* Date preview */}
                          {q.type === "date" && (
                            <div className="pt-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Preview</label>
                              <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                                📅 Select a date...
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                {editingSurvey && (
                  <span className="text-xs text-slate-400 font-medium">Editing: <strong className="text-slate-600">{editingSurvey.title}</strong></span>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button 
                    onClick={() => resetModal()}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={editingSurvey ? handleUpdateSurvey : handleCreateSurvey}
                    disabled={isUploading}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 text-sm flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {editingSurvey ? "Saving..." : "Uploading..."}
                      </>
                    ) : editingSurvey ? (
                      <>
                        <Edit className="w-4 h-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Publish Survey
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
