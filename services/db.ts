
import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { User, Assignment, Submission } from "../types";

// --- Users ---
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, "users"));
  return onSnapshot(q, (snapshot) => {
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    callback(users);
  });
};

export const addUser = async (user: User) => {
  // Gunakan user.user_id sebagai ID dokumen untuk memudahkan rujukan
  await setDoc(doc(db, "users", user.user_id), user);
};

export const deleteUser = async (userId: string) => {
  await deleteDoc(doc(db, "users", userId));
};

// --- Assignments ---
export const subscribeToAssignments = (callback: (assignments: Assignment[]) => void) => {
  // Susun mengikut tarikh dicipta (terbaru di atas)
  const q = query(collection(db, "assignments"), orderBy("created_at", "desc"));
  return onSnapshot(q, (snapshot) => {
    const assignments: Assignment[] = [];
    snapshot.forEach((doc) => {
      assignments.push(doc.data() as Assignment);
    });
    callback(assignments);
  });
};

export const addAssignment = async (assignment: Assignment) => {
  await setDoc(doc(db, "assignments", assignment.id), assignment);
};

// --- Submissions ---
export const subscribeToSubmissions = (callback: (submissions: Submission[]) => void) => {
  const q = query(collection(db, "submissions"));
  return onSnapshot(q, (snapshot) => {
    const submissions: Submission[] = [];
    snapshot.forEach((doc) => {
      submissions.push(doc.data() as Submission);
    });
    callback(submissions);
  });
};

export const addSubmission = async (submission: Submission) => {
  await setDoc(doc(db, "submissions", submission.id), submission);
};

export const updateSubmission = async (submission: Submission) => {
  // setDoc dengan merge: true atau tulis semula keseluruhan objek
  await setDoc(doc(db, "submissions", submission.id), submission, { merge: true });
};

export const deleteSubmission = async (submissionId: string) => {
  await deleteDoc(doc(db, "submissions", submissionId));
};

// Helper untuk padam submission apabila user dipadam
export const deleteSubmissionsByStudentId = async (studentId: string, currentSubmissions: Submission[]) => {
  const studentSubs = currentSubmissions.filter(s => s.student_id === studentId);
  const deletePromises = studentSubs.map(s => deleteDoc(doc(db, "submissions", s.id)));
  await Promise.all(deletePromises);
};
