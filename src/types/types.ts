export interface Lesson {
    _id: string;
    course_id: string;
    title: string;
    video_url: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Progress {
    _id: string;
    lesson_id: string;
    user_id: string;
    status: 'in_progress' | 'completed';
    completed_at: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    category_id: string;
    thumbnail_image_url: string;
    preview_video_url: string;
    price: number;
    actual_price: number;
    author_name: string;
    what_you_learn: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    lessons?: Lesson[];
}

export interface Category {
    _id: string;
    name: string;
    thumbnail_image_url: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type RootStackParamList = {
    Splash: undefined;
    HomeTabs: undefined;
    Login: undefined;
    SignUp: undefined;
    OTPScreen: { tempToken: string; email: string; fromSignup?: boolean };
    ForgotPassword: undefined;
    ResetPasswordOTP: { resetInitToken: string; email: string };
    NewPassword: { resetToken: string };
    ScanningScreen: undefined;
    QuickScanDevices: undefined;
    PairedDevices: undefined;
    Home: undefined;
    Steps: undefined;
    Weather: undefined;
    LMS: undefined;
    Profile: undefined;
    PersonalInfo: undefined;
    ChangePassword: undefined;
    BMIResult: { bmi: string };
    BMI: undefined;
    Nutrition: undefined;
    EditProfile: undefined;
    Subjects: undefined;
    SubjectDetailScreen: undefined;
    TopicDetailScreen: undefined;
    LessonsPage: undefined;
    AboutUsScreen: undefined;
    TermsAndConditionsScreen: undefined;
    VideoSplash: undefined;
    OnboardingCheck: undefined;
    Onboarding: undefined;
    GoogleFitSettings: undefined;


    CourseCategories: undefined;
    CourseList: {
        category: Category;
        courses: Course[];
    };
    CourseDetail: {
        course: Course;
    };

    // Enrollment Screens
    MyEnrollments: undefined;
    EnrolledCourse: {
        courseId: string;
    };
    LessonPlayer: {
        lesson: Lesson;
        courseId: string;
        courseTitle: string;
        allLessons: Lesson[];
        currentIndex: number;
    };
};