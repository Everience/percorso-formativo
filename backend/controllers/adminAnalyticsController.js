const UserModel = require('../models/userModel');
const CourseModel = require('../models/courseModel');

function cleanTitle(title) {
  return (title || '').toString().replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function isCertification(course) {
  return !course.description || course.description.trim() === '';
}

exports.getOverview = async (req, res) => {
  try {
    const userStats = await UserModel.getAnalytics();
    const courseAnalytics = await CourseModel.getAnalytics();

    const devUsers = Number(userStats.dev_count || 0);
    const techUsers = Number(userStats.tech_count || 0);
    const totalUsers = devUsers + techUsers;

    console.log(`[Analytics] devUsers=${devUsers}, techUsers=${techUsers}, totalUsers=${totalUsers}`);

    const allCourseStats = courseAnalytics.courseStats.map((course) => {
      const completedCount = Number(course.completed_count || 0);
      const inProgressCount = Number(course.in_progress_count || 0);
      const notStartedCount = Number(course.not_started_count || 0);
      const cert = isCertification(course);
      const completionRate = (!cert && totalUsers > 0)
        ? Math.round((completedCount / totalUsers) * 1000) / 10
        : 0;

      return {
        id: course.id,
        title: cleanTitle(course.title),
        category: (course.category || '').toString().toUpperCase(),
        isCertification: cert,
        position_row: course.position_row,
        display_order: course.display_order,
        completedCount,
        inProgressCount,
        notStartedCount,
        eligibleUsers: totalUsers,
        completionRate,
      };
    });

    const actualCourses = allCourseStats.filter((c) => !c.isCertification);

    const devActual = actualCourses.filter((c) => c.category === 'DEV').length;
    const techActual = actualCourses.filter((c) => c.category === 'TECH').length;

    const topCourses = [...actualCourses]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);
    const bottomCourses = [...actualCourses]
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5);

    const totalCompleted = actualCourses.reduce((sum, c) => sum + c.completedCount, 0);
    const totalPossible = actualCourses.length * totalUsers;
    const overallCompletionRate = totalPossible > 0
      ? Math.round((totalCompleted / totalPossible) * 1000) / 10
      : 0;

    res.status(200).json({
      users: {
        total: totalUsers,
        byRole: { dev: devUsers, tech: techUsers },
      },
      courses: {
        total: actualCourses.length,
        byCategory: {
          DEV: devActual,
          TECH: techActual,
        },
      },
      completion: {
        overallRate: overallCompletionRate,
        topCourses,
        bottomCourses,
      },
      courseStats: allCourseStats,
    });
  } catch (error) {
    console.error('Errore Admin Analytics:', error);
    res.status(500).json({ message: 'Errore nel recupero delle analytics' });
  }
};
